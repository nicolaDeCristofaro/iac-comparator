import { eksBastionConfig, eksGeneralNgConfig } from "./config";
import "./infrastructure/networking";
import "./infrastructure/kms";
if (eksBastionConfig.enabled) {
    import("./infrastructure/bastion");
    import("./infrastructure/eks/aws-auth-config");
}
import "./infrastructure/eks/node-role";
import "./infrastructure/eks/cluster";
if (eksGeneralNgConfig.enabled) {
    import("./infrastructure/eks/nodegroups");
    import("./infrastructure/eks/addons");
}

// export * from "./outputs";