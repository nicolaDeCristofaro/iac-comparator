import * as aws from "@pulumi/aws";
import { customProvider } from "../../infrastructure/provider";

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
})}, { provider: customProvider });

new aws.iam.RolePolicyAttachment("worker-node-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
}, { provider: customProvider });

new aws.iam.RolePolicyAttachment("cni-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
}, { provider: customProvider });

new aws.iam.RolePolicyAttachment("registry-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
}, { provider: customProvider });

new aws.iam.RolePolicyAttachment("ssm-policy", {
    role: nodeRole.name,
    policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
}, { provider: customProvider });

export { nodeRole };