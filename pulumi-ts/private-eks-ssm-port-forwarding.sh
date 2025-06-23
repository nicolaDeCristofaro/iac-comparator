#!/usr/bin/env bash
set -euo pipefail
CLUSTER=core-eks-cluster-eksCluster-a788d49
BASTION=i-09788544b29133ed3
PROFILE=iac-comparator-pulumi-dev
EP=$(aws eks describe-cluster --name "$CLUSTER" --query 'cluster.endpoint' --profile "$PROFILE" --output text)
HOST=${EP#https://}

echo "127.0.0.1 $HOST" | sudo tee -a /etc/hosts > /dev/null

function cleanup {
  sudo sed -i.bak "/$HOST/d" /etc/hosts
}
trap cleanup EXIT

aws ssm start-session --profile "$PROFILE" \
  --target "$BASTION" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"$HOST\"],\"portNumber\":[\"443\"],\"localPortNumber\":[\"9443\"]}"