import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as aws from "@pulumi/aws";
import { networking } from "../../infrastructure/networking";
import { customProvider } from "../../infrastructure/provider";
import { kmsKey } from "../../infrastructure/kms";
import { nodeRole } from "./node-role";
import { bastionSecurityGroupId, bastionRoleName } from "../../infrastructure/bastion";
import { k8sVersion, kubeproxyAddonVersion, vpcCniAddonVersion, eksBastionConfig } from "../../config";
import * as child_process from "child_process";

// -----------------------------------------------------------------------------
// Resolve the developer’s current public IP at deploy‑time
// -----------------------------------------------------------------------------
/**
 * ----------------------------------------------------------------------------------------
 * Resolve the developer’s current public IP at deploy‑time
 * in order to allow access to the EKS cluster public API endpoint only from that IP.
 * This is useful to be secure also in the development process.
 * ----------------------------------------------------------------------------------------
 */
const myPublicIp = child_process
  .execSync("curl -s https://checkip.amazonaws.com")
  .toString()
  .trim();
const myPublicCidr = `${myPublicIp}/32`;

/**
 * ----------------------------------------------------------------------------------------
 * EKS Cluster
 * ----------------------------------------------------------------------------------------
 */
const eksCluster = new eks.Cluster("core-eks-cluster", {
    vpcId            : networking.vpcId,
    privateSubnetIds : networking.privateSubnetIds,   // for worker nodes

    // Kubernetes version (optional): Pulumi picks latest stable if not set
    version: k8sVersion,

    // Network exposure for cluster endpoint
    endpointPrivateAccess: true,
    endpointPublicAccess : true,
    publicAccessCidrs: [myPublicCidr],

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

eksCluster.core.clusterSecurityGroup?.apply(sg => {
    if (!sg || !eksBastionConfig.enabled) return;
    new aws.ec2.SecurityGroupRule("eks-cluster-from-bastion", {
        type: "ingress",
        fromPort: 443,
        toPort: 443,
        protocol: "tcp",
        securityGroupId: sg.id,
        sourceSecurityGroupId: bastionSecurityGroupId,
        description: "Allow traffic from bastion to EKS cluster API",
    }, { provider: customProvider });
});

new aws.iam.RolePolicy("bastion-eks-policy", {
    role: bastionRoleName,
    policy: pulumi.output({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Action: "eks:DescribeCluster",
            Resource: eksCluster.core.cluster.arn,
        }],
    }).apply(JSON.stringify),
}, { provider: customProvider });

export { eksCluster };