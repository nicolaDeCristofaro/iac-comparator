import { eksBastionConfig, eksGeneralNgConfig } from "./config";
import "./infrastructure/networking";
import "./infrastructure/kms";
if (eksBastionConfig.enabled) {
    require("./infrastructure/bastion");
    require("./infrastructure/eks/aws-auth-config");
}
import "./infrastructure/eks/node-role";
import "./infrastructure/eks/cluster";
if (eksGeneralNgConfig.enabled) {
    require("./infrastructure/eks/nodegroups");
    require("./infrastructure/eks/addons");
}

export * from "./outputs";