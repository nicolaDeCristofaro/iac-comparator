#!/usr/bin/env bash
set -euo pipefail
CLUSTER=core-eks-cluster-eksCluster-d1efcf0 # take dynamically
BASTION=i-053f02b9102f3726a # take dynamically
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