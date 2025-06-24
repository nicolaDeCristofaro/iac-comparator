#!/usr/bin/env bash
set -euo pipefail

CLUSTER_ARN=arn:aws:eks:eu-central-1:144326432050:cluster/core-eks-cluster-eksCluster-d1efcf0
CLUSTER=${CLUSTER_ARN##*/}
PROFILE=iac-comparator-pulumi-dev
EP=$(aws eks describe-cluster --name "$CLUSTER" --query 'cluster.endpoint' --profile "$PROFILE" --output text)
HOST=${EP#https://}

aws eks update-kubeconfig --name $CLUSTER --profile $PROFILE

kubectl config set-cluster "$CLUSTER_ARN" --server="https://$HOST:9443"

kubectl config set-context --current --cluster "$CLUSTER_ARN"