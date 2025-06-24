/* -------------------------------------------------------------------------
 * Stack outputs
 * -----------------------------------------------------------------------*/
import {
  vpcId,
  privateSubnetIds,
  publicSubnetIds,
} from "../infrastructure/networking";
import * as kms from "../infrastructure/kms";
import * as bastion from "../infrastructure/bastion";
import * as eksCluster from "../infrastructure/eks/cluster";
import * as eksNodeRole from "../infrastructure/eks/node-role";
import * as eksNodeGroups from "../infrastructure/eks/nodegroups";
import * as eksAddons from "../infrastructure/eks/addons";

export const outputs = {
  networking: {
    vpcId,
    privateSubnetIds,
    publicSubnetIds,
  },
  kms,
  bastion,
  eksCluster,
  eksNodeRole,
  eksNodeGroups,
  eksAddons,
};