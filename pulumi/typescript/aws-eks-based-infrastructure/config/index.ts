import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

/**
/* ----------------------------------------------------------------------------------------
/* Parameters - Grab some values from the Pulumi configuration (or use default values)
/* ----------------------------------------------------------------------------------------
 */
export const cfg                   = new pulumi.Config();

export const vpcCidr               = cfg.get("vpcCidr")   ?? "10.0.0.0/16";
export const azCount               = cfg.getNumber("azs") ?? 3;

export const eksBastionConfig = {
    enabled     : cfg.getBoolean("eksBastionEnabled") ?? true,
    diskSize    : cfg.getNumber("eksBastionDiskSize") ?? 50,
    amiType     : cfg.get("eksBastionAmiType") ?? "AL3_x86_64",
    instanceType: cfg.get("eksBastionInstanceType") ?? "t3.micro",
};

export const k8sVersion            = cfg.get("k8sVersion")?? "1.33";
export const kubeproxyAddonVersion = cfg.get("kubeProxyAddonVersion") ?? "v1.33.0-eksbuild.2";
export const vpcCniAddonVersion   = cfg.get("vpcCniAddonVersion") ?? "v1.19.5-eksbuild.3";
export const corednsAddonVersion   = cfg.get("corednsAddonVersion") ?? "v1.12.1-eksbuild.2";

export const eksGeneralNgConfig = {
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
};