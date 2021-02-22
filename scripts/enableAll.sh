#!/bin/bash

echo "======================= Creating Channel ======================="
sudo docker exec -it cli ./scripts/channel/createChannel.sh

echo "======================= Adding peer to Channel ======================="
sudo docker exec -it cli ./scripts/channel/joinPeer.sh peer0 medplace2 Hospital2MSP 8051 1.0

echo "======================= Installing chaincode ======================="
sudo docker exec -it cli ./scripts/channel/installChain.sh peer0 medplace1 Hospital1MSP 7051 1.0
sudo docker exec -it cli ./scripts/channel/installChain.sh peer0 medplace2 Hospital2MSP 8051 1.0

echo "======================= Instanciate chaincode ======================="
sudo docker exec -it cli ./scripts/channel/instanciate.sh