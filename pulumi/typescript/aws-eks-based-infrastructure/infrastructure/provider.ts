import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Define default tags
export const defaultTags = {
    Project: pulumi.getProject(),
    Stack: pulumi.getStack(),
    ManagedBy: "Pulumi",
};

// Custom provider with default tags
export const customProvider = new aws.Provider("custom-aws", {
    profile: aws.config.profile,
    defaultTags: {
        tags: defaultTags,
    },
});