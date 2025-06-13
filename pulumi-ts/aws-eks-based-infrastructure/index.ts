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
// const eksNodeInstanceType   = cfg.get("eksNodeInstanceType")  ?? "t3.medium";
// const desiredClusterSize    = cfg.getNumber("desiredClusterSize") ?? 1;
// const minClusterSize        = cfg.getNumber("min") ?? 1;
// const maxClusterSize        = cfg.getNumber("max") ?? 5;

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
    kubeProxyAddonOptions: {
        version: "v1.33.0-eksbuild.2",
    },
    vpcCniOptions: {
        addonVersion: "v1.19.5-eksbuild.3",
    },
    createOidcProvider: true,
    enabledClusterLogTypes: []
}, { provider: customProvider });

export const kubeconfig = eksCluster.kubeconfig;