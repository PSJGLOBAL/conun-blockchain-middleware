# CONUN BLOCKCHAIN MIDDLEWARE

## Open config folder, use only json config files:
- connection-org1.json
- connection-org1.yaml
- connection-org2.json
- connection-org2.yaml

1. Import tlsCACerts Certificates into "connection-org1.json":

        "peers": {
            "peer0.org1.example.com": {
                "url": "grpcs://localhost:7051",
                "tlsCACerts": {
                    "pem": "-----BEGIN CERTIFICATE----- 
                    [get ca from conun blockchain network path:  project_path/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt]
                     -----END CERTIFICATE-----\n"
                },
                "grpcOptions": {
                    "ssl-target-name-override": "peer0.org1.example.com",
                    "hostnameOverride": "peer0.org1.example.com"
                }
            },
            "peer1.org1.example.com": {
                "url": "grpcs://localhost:8051",
                "tlsCACerts": {
                    "pem": "-----BEGIN CERTIFICATE----- 
                    [get ca from conun blockchain network path: project_path/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt]
                     -----END CERTIFICATE-----\n"
                },
                "grpcOptions": {
                    "ssl-target-name-override": "peer1.org1.example.com",
                    "hostnameOverride": "peer1.org1.example.com"
                }
            }
        },
        "certificateAuthorities": {
            "ca.org1.example.com": {
                "url": "https://localhost:7054",
                "caName": "ca.org1.example.com",
                "tlsCACerts": {
                    "pem": "-----BEGIN CERTIFICATE----- 
                    [get ca from conun blockchain network path: project_path/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem]
                     -----END CERTIFICATE-----\n"
                },
                "httpOptions": {
                    "verify": false
                }
            }
        }

2. Import tlsCACerts Certificates into "connection-org2.json":

        "peers": {
            "peer0.org2.example.com": {
                "url": "grpcs://localhost:9051",
                "tlsCACerts": {
                    "pem": "-----BEGIN CERTIFICATE----- 
                    [get ca from conun blockchain network path: project_path/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt]
                     -----END CERTIFICATE-----\n"
                },
                "grpcOptions": {
                    "ssl-target-name-override": "peer0.org2.example.com",
                    "hostnameOverride": "peer0.org2.example.com"
                }
            },
            "peer1.org2.example.com": {
                "url": "grpcs://localhost:10051",
                "tlsCACerts": {
                    "pem": "-----BEGIN CERTIFICATE----- 
                    [get ca from conun blockchain network path: project_path/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt]
                     -----END CERTIFICATE-----\n"
                },
                "grpcOptions": {
                    "ssl-target-name-override": "peer1.org2.example.com",
                    "hostnameOverride": "peer1.org2.example.com"
                }
            }
        },
        "certificateAuthorities": {
            "ca.org2.example.com": {
                "url": "https://localhost:8054",
                "caName": "ca-org2",
                "tlsCACerts": {
                    "pem": "-----BEGIN CERTIFICATE----- 
                    [get ca from conun blockchain network path: project_path/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/ca/ca.org2.example.com-cert.pem]
                     -----END CERTIFICATE-----\n"
                },
                "httpOptions": {
                    "verify": false
                }
            }
        }

3. Install Package Dependencies and run network:

        npm install

        node app.js

4. Production Host gateway available:

        sudo vim /etc/hosts


        [blockchain_ip] peer0.org1.example.com
        [blockchain_ip] peer1.org1.example.com
        [blockchain_ip] orderer.example.com
        [blockchain_ip] peer0.org2.example.com
        [blockchain_ip] peer1.org2.example.com
        [blockchain_ip] orderer2.example.com
        [blockchain_ip] orderer3.example.com
        [blockchain_ip] ca.org1.example.com
        [blockchain_ip] ca.org2.example.com
        [blockchain_ip] ca_orderer       