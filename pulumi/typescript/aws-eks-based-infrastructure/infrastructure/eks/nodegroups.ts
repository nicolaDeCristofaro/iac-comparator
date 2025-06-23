import * as eks from "@pulumi/eks";
import { eksCluster } from "./cluster";
import { networking } from "../../infrastructure/networking";   
import { customProvider } from "../../infrastructure/provider";
import { nodeRole } from "./node-role";
import { eksGeneralNgConfig } from "../../config";

/* -------------------------------------------------------------------------
 * Custom general Managed EKS Node group
 * -----------------------------------------------------------------------*/
let generalNg: eks.ManagedNodeGroup | undefined;
if (eksGeneralNgConfig.enabled) {
    generalNg = new eks.ManagedNodeGroup("general-ng", {
        cluster: eksCluster,
        nodeGroupName: eksGeneralNgConfig.name,
        scalingConfig: {
            desiredSize: eksGeneralNgConfig.desiredSize,
            minSize: eksGeneralNgConfig.minSize,
            maxSize: eksGeneralNgConfig.maxSize,
        },
        ignoreScalingChanges: true,
        amiType: eksGeneralNgConfig.amiType,
        capacityType: eksGeneralNgConfig.capacityType,
        diskSize: eksGeneralNgConfig.diskSize,
        enableIMDSv2: true,
        instanceTypes: [eksGeneralNgConfig.instanceType],
        subnetIds: networking.privateSubnetIds,
        nodeRoleArn: nodeRole.arn,
        taints: eksGeneralNgConfig.taints,
        labels: eksGeneralNgConfig.labels,
    }, { provider: customProvider });
}

export { generalNg };