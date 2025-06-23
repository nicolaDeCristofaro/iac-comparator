import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as aws from "@pulumi/aws";
import { networking } from "../../infrastructure/networking";
import { customProvider } from "../../infrastructure/provider";
import { kmsKey } from "../../infrastructure/kms";
import { nodeRole } from "./node-role";
import { bastionSecurityGroupId, bastionRoleName } from "../../infrastructure/bastion";
import { k8sVersion, kubeproxyAddonVersion, vpcCniAddonVersion, eksBastionConfig } from "../../config";

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