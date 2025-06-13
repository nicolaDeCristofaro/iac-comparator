import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";


// Define default tags
const defaultTags = {
    Project: pulumi.getProject(),
    Stack: pulumi.getStack(),
    ManagedBy: "Pulumi",
};

// Create a custom provider with default tags
const customProvider = new aws.Provider("custom-aws", {
    profile: aws.config.profile,
    defaultTags: {
        tags: defaultTags,
    },
});

/**
/* ----------------------------------------------------------------------------------------
/* Parameters - Grab some values from the Pulumi configuration (or use default values)
/* ----------------------------------------------------------------------------------------
 */
const cfg                   = new pulumi.Config();
const vpcCidr               = cfg.get("vpcCidr")   ?? "10.0.0.0/16";
const azCount               = cfg.getNumber("azs") ?? 3;
const k8sVersion            = cfg.get("k8sVersion")?? "1.33";
const kubeproxyAddonVersion = cfg.get("kubeProxyAddonVersion") ?? "v1.33.0-eksbuild.2";
const vpcCniAddonVersion   = cfg.get("vpcCniAddonVersion") ?? "v1.19.5-eksbuild.3";
const corednsAddonVersion   = cfg.get("corednsAddonVersion") ?? "v1.12.1-eksbuild.2";

const eksGeneralNgConfig = {
    enabled     : cfg.getBoolean("eksGeneralManagedNg") ?? true,
    name        : cfg.get("eksGeneralManagedNgName") ?? "general",
    diskSize    : cfg.getNumber("eksGeneralManagedNgDiskSize") ?? 50,
    amiType     : cfg.get("eksGeneralManagedNgAmiType") ?? "AL2_x86_64",
    capacityType: cfg.get("eksGeneralManagedNgCapacityType") ?? "ON_DEMAND",
    taints      : cfg.getObject<aws.types.input.eks.NodeGroupTaint[]>("eksGeneralManagedNgTaints") ?? [],
    labels      : cfg.getObject<Record<string, string>>("eksGeneralManagedNgLabels") ?? {},
    instanceType: cfg.get("eksGeneralManagedNgInstanceType") ?? "t3.medium",
    desiredSize : cfg.getNumber("eksGeneralManagedNgDesiredSize") ?? 1,
    minSize     : cfg.getNumber("eksGeneralManagedNgMinSize") ?? 1,
    maxSize     : cfg.getNumber("eksGeneralManagedNgMaxSize") ?? 5,
} as const;

/**
 * ----------------------------------------------------------------------------------------
 * VPC – explicit, self‑documenting configuration
 * ----------------------------------------------------------------------------------------
 * We keep relevant settings visible so that defaults are never a surprise.
 * If you want to customize IG, NAT and route tables names you cannot do it with this awsx.Vpc
 * class, you have to use aws.ec2.Vpc class instead.
 */
const vpc = new awsx.ec2.Vpc("core-vpc", {
    /* ─── General ──────────────────────────────────────────────────────────── */
    cidrBlock: vpcCidr,                 // Primary IPv4 range for the VPC
    enableDnsSupport: true,             // Enable Amazon‑provided DNS resolution
    enableDnsHostnames: true,           // Allow instances to get internal hostnames
    /* ─── Topology ─────────────────────────────────────────────────────────── */
    numberOfAvailabilityZones: azCount, // How many AZs to span => N public + N private subnets
    // NAT strategy: One gateway per AZ (best HA).  “Single” is cheaper; “None” == isolated.
    natGateways: { strategy: "OnePerAz" },
    // Subnet layout: one /24 public + one /24 private per AZ
    subnetStrategy: "Auto",
    subnetSpecs: [
        {
            type: "Public",             // Internet‑routable
            name: "pub-subnet",
            cidrMask: 24,               // /24 ⇒ 256 IPs per subnet
        },
        {
            type: "Private",            // Egress via NAT only
            name: "priv-subnet",
            cidrMask: 24,               // /24 ⇒ 256 IPs per subnet
        },
    ],
}, { provider: customProvider });

/**
 * ----------------------------------------------------------------------------------------
 * KMS key and alias for EKS secret encryption
 * ----------------------------------------------------------------------------------------
 */
const kmsKey = new aws.kms.Key("eks-secrets-kms", {
    description: "KMS key for EKS secret encryption",
    enableKeyRotation: true,
});

const kmsAlias = new aws.kms.Alias("eks-secrets-kms-alias", {
    name: "alias/eks-secrets-kms",
    targetKeyId: kmsKey.id,
}, { provider: customProvider });

/* -------------------------------------------------------------------------
 * EKS Node group IAM role
 * -----------------------------------------------------------------------*/
const nodeRole = new aws.iam.Role("node-role", {assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Sid: "",
        Principal: {
            Service: "ec2.amazonaws.com",
        },
    }],
})});
const workerNodePolicy = new aws.iam.RolePolicyAttachment("worker-node-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
});
const cniPolicy = new aws.iam.RolePolicyAttachment("cni-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
});
const registryPolicy = new aws.iam.RolePolicyAttachment("registry-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
});
const ssmPolicy = new aws.iam.RolePolicyAttachment("ssm-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
});

/**
 * ----------------------------------------------------------------------------------------
 * EKS Cluster
 * ----------------------------------------------------------------------------------------
 */
const eksCluster = new eks.Cluster("core-eks-cluster", {
    vpcId            : vpc.vpcId,
    privateSubnetIds : vpc.privateSubnetIds,   // for worker nodes

    // Kubernetes version (optional): Pulumi picks latest stable if not set
    version: k8sVersion,

    // Network exposure for cluster endpoint
    endpointPrivateAccess: false,
    endpointPublicAccess : true,

    encryptionConfigKeyArn: kmsKey.arn, // KMS key for encrypting secrets

    skipDefaultNodeGroup: true,             // we’ll add our own node groups
    instanceRoles: [nodeRole],              // Role for worker nodes

    kubeProxyAddonOptions: {
        version: kubeproxyAddonVersion,
    },
    vpcCniOptions: {
        addonVersion: vpcCniAddonVersion,
    },
    createOidcProvider: true,
    enabledClusterLogTypes: []
}, { provider: customProvider });

/* -------------------------------------------------------------------------
 * Custom general Managed EKS Node group
 * -----------------------------------------------------------------------*/
let generalNg: eks.ManagedNodeGroup | undefined;
if (eksGeneralNgConfig.enabled) {
    generalNg = new eks.ManagedNodeGroup("general-ng", {
        cluster: eksCluster,
        nodeGroupName: eksGeneralNgConfig.name,
        scalingConfig: {
            desiredSize: eksGeneralNgConfig.desiredSize,
            minSize: eksGeneralNgConfig.minSize,
            maxSize: eksGeneralNgConfig.maxSize,
        },
        ignoreScalingChanges: true,
        amiType: eksGeneralNgConfig.amiType,
        capacityType: eksGeneralNgConfig.capacityType,
        diskSize: eksGeneralNgConfig.diskSize,
        enableIMDSv2: true,
        instanceTypes: [eksGeneralNgConfig.instanceType],
        subnetIds: vpc.privateSubnetIds,
        nodeRoleArn: nodeRole.arn,
        taints: eksGeneralNgConfig.taints,
        labels: eksGeneralNgConfig.labels,
    });
}

/* -------------------------------------------------------------------------
 * CoreDNS managed addon — create *after* we have compute
 * -----------------------------------------------------------------------*/
const coreDnsAddon = new aws.eks.Addon("coredns-addon", {
    addonName   : "coredns",
    addonVersion: corednsAddonVersion,
    clusterName : eksCluster.core.cluster.name,
    resolveConflictsOnCreate: "OVERWRITE",
    resolveConflictsOnUpdate: "OVERWRITE",
}, {
    provider : customProvider,
    dependsOn: generalNg ? [generalNg] : [],
});