import * as fs from "fs";
import * as path from "path";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { networking } from "../networking";
import { defaultTags, customProvider } from "../../infrastructure/provider";
import { eksBastionConfig, k8sVersion } from "../../config";

/**
 * ----------------------------------------------------------------------------------------
 * Bastion host to access the EKS cluster privately via AWS Systems Manager (SSM)
 * ----------------------------------------------------------------------------------------
 *
 * Design notes
 * --------------------------------------
 * - Instance lives in a private subnet > no public IP, no inbound ports
 * - All administration happens through SSM Session Manager > audited and logged
 * - Security group has egress‑only rule (HTTPS → 0.0.0.0/0) so the instance
 *   can reach the SSM, ECR and EKS endpoints
 */

/* -------------------------------------------------------------------------
 * Inject dynamic values into bootstrap script
 * -----------------------------------------------------------------------*/
const rawScript = fs.readFileSync(
        path.join(__dirname, "bootstrap.sh"),
        "utf8",
    );

const userData = pulumi
    .all([])
    .apply(([k8sVersion]) =>
        rawScript
        .replace(/__K8S_MINOR_VERSION__/g, k8sVersion),
    );

/* -------------------------------------------------------------------------
 * Security Group — egress‑only, no ingress required for SSM
 * -----------------------------------------------------------------------*/
const bastionSg = new aws.ec2.SecurityGroup("eks-bastion-sg", {
    vpcId      : networking.vpcId,
    description: "Security group for the Bastion host (SSM only, no inbound)",
    egress     : [{
        protocol  : "-1",
        fromPort  : 0,
        toPort    : 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
    tags: {
        ...defaultTags,
        Name: "eks-bastion-sg",
    },
}, { provider: customProvider });

/* -------------------------------------------------------------------------
 * IAM Role & Instance Profile for the Bastion host
 * -----------------------------------------------------------------------*/
const bastionRole = new aws.iam.Role("bastion-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: { Service: "ec2.amazonaws.com" },
            Action: "sts:AssumeRole",
        }],
    }),
}, { provider: customProvider });

/* ‑‑‑‑ Attach policies:
 * 1. AmazonSSMManagedInstanceCore  ➜ SSM agent registration & Session Manager
 * 2. AmazonEKSClusterPolicy        ➜ kubectl / eksctl from the Bastion
 */
new aws.iam.RolePolicyAttachment("bastion-ssm-policy", {
    role      : bastionRole.name,
    policyArn : "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
}, { provider: customProvider });

new aws.iam.RolePolicy("bastion-eks-s3-access", {
    role: bastionRole.name,
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
        {
            Effect: "Allow",
            Action: "s3:ListBucket",
            Resource: "arn:aws:s3:::amazon-eks",
        },
        ],
    }),
}, { provider: customProvider });

const bastionInstanceProfile = new aws.iam.InstanceProfile("eks-bastion-instance-profile", {
    role: bastionRole.name,
}, { provider: customProvider });

/* -------------------------------------------------------------------------
 * Find the latest Amazon Linux 2 AMI
 * -----------------------------------------------------------------------*/
const amazonLinuxAmi = pulumi.output(aws.ec2.getAmi({
    owners: ["amazon"],
    mostRecent: true,
    filters: [
        {
            name: "name",
            values: eksBastionConfig.amiType === "AL3_x86_64"
                ? ["al2023-ami-*-x86_64"] // Amazon Linux 2023 naming pattern
                : ["amzn2-ami-hvm-*"],    // Fallback to Amazon Linux 2
        },
    ],
}, { provider: customProvider }));

/* -------------------------------------------------------------------------
 * EC2 Instance — the SSM–managed Bastion host
 * -----------------------------------------------------------------------*/
const bastionHost = new aws.ec2.Instance("eks-bastion-host", {
    ami                  : amazonLinuxAmi.id,
    instanceType         : eksBastionConfig.instanceType,
    subnetId             : networking.privateSubnetIds.apply(ids => ids[0]), // first private subnet
    vpcSecurityGroupIds  : [bastionSg.id],
    iamInstanceProfile   : bastionInstanceProfile.name,
    associatePublicIpAddress: false,
    monitoring           : true,   // detailed monitoring
    rootBlockDevice: {
        volumeSize: eksBastionConfig.diskSize,
        volumeType: "gp3",
    },
    tags: {
        ...defaultTags,
        Name: "eks-bastion",
    },
    userData,
}, { provider: customProvider });

/* -------------------------------------------------------------------------
 * Bastion host outputs
 * -----------------------------------------------------------------------*/
export const bastionInstanceId      = bastionHost.id;
export const bastionSecurityGroupId = bastionSg.id;
export const bastionRoleName        = bastionRole.name
export const bastionRoleArn         = bastionRole.arn;