#!/bin/bash
set -e

# Install AWS CLI v2
yum remove -y awscli
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install
aws --version

# Pulumi substitutes these three placeholders at deploy time
K8S_MINOR_VERSION="__K8S_MINOR_VERSION__"

# Detect the latest full patch version (e.g. 1.33.0)
FULL_VERSION="$(aws s3api list-objects-v2 --bucket amazon-eks\
  --prefix "${K8S_MINOR_VERSION}" --delimiter "/" --region us-west-2 \
  --query 'CommonPrefixes[*].Prefix' --output text \
  | tr '\t' '\n' \
  | grep -E "^${K8S_MINOR_VERSION//./\\.}\\.0/$" \
  | sed 's:/$::')"

# Detect the latest release folder under that full version (e.g. 2025-06-10)
LATEST_RELEASE="$(aws s3api list-objects-v2 --bucket amazon-eks \
  --prefix "${FULL_VERSION}/" --delimiter "/" --region us-west-2 \
  --query 'CommonPrefixes[*].Prefix' --output text \
  | tr '\t' '\n' | sort -V | tail -n 1 | cut -d'/' -f2)"

# Install matching kubectl for this cluster
curl -O "https://s3.us-west-2.amazonaws.com/amazon-eks/${FULL_VERSION}/${LATEST_RELEASE}/bin/linux/amd64/kubectl"
chmod +x ./kubectl
mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$HOME/bin:$PATH
echo 'export PATH=$HOME/bin:$PATH' >> ~/.bash_profile
kubectl version --client