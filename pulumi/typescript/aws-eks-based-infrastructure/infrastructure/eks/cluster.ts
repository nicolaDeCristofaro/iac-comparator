import * as eks from "@pulumi/eks";
import { networking } from "../../infrastructure/networking";
import { customProvider } from "../../infrastructure/provider";
import { kmsKey } from "../../infrastructure/kms";
import { nodeRole } from "./node-role";
import { k8sVersion, kubeproxyAddonVersion, vpcCniAddonVersion } from "../../config";
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

export { eksCluster };