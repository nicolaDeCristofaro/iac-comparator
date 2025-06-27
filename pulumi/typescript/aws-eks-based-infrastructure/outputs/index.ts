/* -------------------------------------------------------------------------
 * Stack outputs
 * -----------------------------------------------------------------------*/
import * as networking from "../infrastructure/networking";
import * as kms from "../infrastructure/kms";
import * as bastion from "../infrastructure/bastion";
import * as eksCluster from "../infrastructure/eks/cluster";
import * as eksNodeRole from "../infrastructure/eks/node-role";
import * as eksNodeGroups from "../infrastructure/eks/nodegroups";
import * as eksAddons from "../infrastructure/eks/addons";
import { eksBastionConfig, eksGeneralNgConfig } from "../config";

// Format Outputs
export const outputs = {
  networking: {
    vpcId: networking.networking.vpcId,
    privateSubnetIds: networking.networking.privateSubnetIds,
    publicSubnetIds: networking.networking.publicSubnetIds,
  },
  kms: {
    kmsKeyId: kms.kmsKey.id,
    kmsKeyArn: kms.kmsKey.arn,
    kmsKeyAlias: kms.kmsAlias.name,
  },
  bastion: {
    ...(eksBastionConfig.enabled && {
      bastionInstanceId: bastion.bastionInstanceId,
      bastionSecurityGroupId: bastion.bastionSecurityGroupId,
      bastionRoleName: bastion.bastionRoleName,
      bastionRoleArn: bastion.bastionRoleArn,
    }),
  },
  eksCluster: {
    eksClusterName: eksCluster.eksCluster.core.cluster.name,
    eksClusterId: eksCluster.eksCluster.core.cluster.id,
    eksClusterArn: eksCluster.eksCluster.core.cluster.arn,
    eksClusterEndpoint: eksCluster.eksCluster.core.cluster.endpoint,
    eksClusterSecurityGroup: eksCluster.eksCluster.clusterSecurityGroupId,
    eksClusterVersion: eksCluster.eksCluster.core.cluster.version,
    eksClusterOidcProviderArn: eksCluster.eksCluster.oidcProviderArn,
    eksClusterOidcProviderUrl: eksCluster.eksCluster.oidcProviderUrl,
  },
  eksNodeRole: {
    eksNodeRoleArn: eksNodeRole.nodeRole.arn,
  },
  eksNodeGroups: {
    ...(eksGeneralNgConfig.enabled &&  {
      generalNg : {
        eksGeneralNgName: eksNodeGroups.generalNg?.nodeGroup.nodeGroupName,
        eksGeneralNgId: eksNodeGroups.generalNg?.nodeGroup.id,
        eksGeneralNgArn: eksNodeGroups.generalNg?.nodeGroup.arn,
        eksGeneralNgStatus: eksNodeGroups.generalNg?.nodeGroup.status,
      }
    }),
  },
  eksAddons: {
    ...(eksGeneralNgConfig.enabled &&  {
      coreDnsAddon: {
        eksCoreDnsAddonArn: eksAddons.coreDnsAddon.arn,
      }
    }),
  },
};