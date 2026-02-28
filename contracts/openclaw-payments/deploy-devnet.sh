#!/bin/bash
# Deploy script for openclaw-payments on MultiversX Devnet
# Requires mxpy to be installed: https://docs.multiversx.com/sdk-and-tools/sdk-py/install/

PEM_FILE="../../wallets/devnet.pem" # Adjust this path to your PEM file
PROXY="https://devnet-gateway.multiversx.com"
CHAIN_ID="D"

if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file not found at $PEM_FILE"
    echo "Please create one using: mxpy wallet new --format pem --outfile $PEM_FILE"
    echo "And fund it using the devnet faucet: https://devnet-wallet.multiversx.com/"
    exit 1
fi

echo "1. Building the contract..."
mxpy contract build

echo "2. Deploying contract to devnet..."
mxpy contract deploy --bytecode output/openclaw-payments.wasm \
    --recall-nonce --pem "$PEM_FILE" \
    --gas-limit 50000000 \
    --proxy "$PROXY" --chain "$CHAIN_ID" \
    --send --outfile deploy-devnet.interaction.json

echo "Done! Check deploy-devnet.interaction.json for the contract address."
