import * as aws from "@pulumi/aws";
import { customProvider } from "../infrastructure/provider";

/**
 * ----------------------------------------------------------------------------------------
 * KMS key and alias for EKS secret encryption
 * ----------------------------------------------------------------------------------------
 */
const kmsKey = new aws.kms.Key("eks-secrets-kms", {
    description: "KMS key for EKS secret encryption",
    enableKeyRotation: true,
}, { provider: customProvider });

const kmsAlias = new aws.kms.Alias("eks-secrets-kms-alias", {
    name: "alias/eks-secrets-kms",
    targetKeyId: kmsKey.id,
}, { provider: customProvider });

/* ------------------------------------------------------------------
 * Networking outputs
 * ----------------------------------------------------------------*/
export { kmsKey, kmsAlias };