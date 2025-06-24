import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { eksCluster } from "./cluster";
import { bastionRoleArn } from "../../infrastructure/bastion";
import { generalNg } from "./nodegroups";

/** ------------------------------------------------------------------
 *  k8s provider wired to the EKS kubeconfig and AWS profile
 * ------------------------------------------------------------------ */
const kubeconfigWithProfile = eksCluster.kubeconfig.apply(cfg => {
    const kc: any = typeof cfg === "string" ? JSON.parse(cfg) : cfg;

    if (kc?.users?.[0]?.user?.exec) {
        kc.users[0].user.exec.env = kc.users[0].user.exec.env ?? [];
        kc.users[0].user.exec.env.push({
            name : "AWS_PROFILE",
            value: aws.config.profile || "default",
        });
    }
    return JSON.stringify(kc);
});

const k8sProvider = new k8s.Provider("eks-k8s-provider", { kubeconfig: kubeconfigWithProfile });

/** ------------------------------------------------------------------
 *  Patch the aws-auth ConfigMap (append the Bastion role)
 * ------------------------------------------------------------------ */
const bastionRoleMapping = pulumi.interpolate`
- rolearn: ${bastionRoleArn}
  username: bastion
  groups:
    - system:masters`;

// Existing aws-auth ConfigMap
const existingAwsAuth = k8s.core.v1.ConfigMap.get(
    "aws-auth-existing",
    "kube-system/aws-auth",
    { provider: k8sProvider },
);

const updatedMapRoles = pulumi
    .all([existingAwsAuth.data, bastionRoleArn, bastionRoleMapping])
    .apply(([data, arn, mapping]) => {
        const current = data?.["mapRoles"] ?? "";
        return current.includes(arn)
            ? current
            : `${current.trim()}\n${mapping.trim()}`;
    });

new k8s.core.v1.ConfigMapPatch("aws-auth-bastion-patch", {
    metadata: {
        name: "aws-auth",
        namespace: "kube-system",
        annotations: {
            "pulumi.com/patchForce": "true",
            "pulumi.com/patchFieldManager": "aws-auth-bastion",
        },
    },
    data: {
        mapRoles: updatedMapRoles,
    },
}, { 
    provider: k8sProvider,
    dependsOn: generalNg ? [generalNg] : undefined,
});