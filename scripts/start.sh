#!/bin/bash

echo "Creating containers... "
docker-compose -f docker-compose-cli.yaml up -d
echo 
echo "Containers started" 
echo 
docker ps

echo
#Creating channel and join org1
docker exec -it cli ./scripts/channel/createChannel.sh
#Creating channel and join org2
docker exec -e "CORE_PEER_LOCALMSPID=Hospital1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/medplace1.example.com/users/Admin@medplace1.example.com/msp" -e "CORE_PEER_ADDRESS=peer0.medplace1.example.com:7051" -it cli ./scripts/channel/joinOrg2.sh


