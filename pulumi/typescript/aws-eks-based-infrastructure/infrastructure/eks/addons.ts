import * as aws from "@pulumi/aws";
import { eksCluster } from "./cluster";
import { generalNg } from "./nodegroups";
import { customProvider } from "../../infrastructure/provider";
import { corednsAddonVersion } from "../../config";

/* -------------------------------------------------------------------------
 * CoreDNS managed addon — create *after* we have compute
 * -----------------------------------------------------------------------*/
const coreDnsAddon = new aws.eks.Addon("coredns-addon", {
    addonName   : "coredns",
    addonVersion: corednsAddonVersion,
    clusterName : eksCluster.core.cluster.name,
    resolveConflictsOnCreate: "OVERWRITE",
    resolveConflictsOnUpdate: "OVERWRITE",
}, {
    provider : customProvider,
    dependsOn: generalNg ? [generalNg] : undefined,
});