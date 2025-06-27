import * as awsx from "@pulumi/awsx";
import { customProvider } from "../infrastructure/provider";
import { vpcCidr, azCount } from "../config";

/**
 * ----------------------------------------------------------------------------------------
 * VPC and other networking components – explicit, self‑documenting configuration
 * ----------------------------------------------------------------------------------------
 * We keep relevant settings visible so that defaults are never a surprise.
 * If you want to customize IG, NAT and route tables names you cannot do it with this awsx.Vpc
 * class, you have to use aws.ec2.Vpc class instead and other specific components.
 */
const networking = new awsx.ec2.Vpc("core-vpc", {
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

export { networking };
