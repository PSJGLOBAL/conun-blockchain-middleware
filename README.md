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

        sudo nano /etc/hosts

        ex: 192.168.0.0 peer0.org1.example.com

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



5. Docker:
    1 - Install:
    
    ```bash
    sudo apt-get update 
    sudo apt-get upgrade
    sudo apt install docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo systemctl status docker
    docker --versio
    ```

    2 - Switch user:    
    ```bash
    sudo usermod -aG docker ${USER}
    su - ${USER}
    id -nG
    sudo usermod -aG docker addusernamehere
    ```

    NOTE: if you want to build only one image ther following cmd:
    3 - Build:
    ```bash
    docker build --tag conun-middleware-testnet-v3:0.1 .
    ```
    
    4 - Run Docker image:
    ```bash
    docker run -d -p 4040:4040 -v /home/conun/conun-middleware-testnet-v3/wallet:/conun-middleware-testnet-v3/wallet -it conun-middleware-testnet-v3:0.1
    ```

    5 - install editor inside docker:
    ```bash
    apt-get update && apt-get install nano
    ```

6. Docker Compose:
    ```bash
    sudo apt install docker-compose
    docker-compose --version
    ```
  
7. MONGODB 
- [installation doc](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition)

    If you have issue with mongodb, run following cmd:

    ```bash
    chown -R mongodb:mongodb /var/lib/mongodb
    chown mongodb:mongodb /tmp/mongodb-27017.sock
    sudo systemctl enable mongod
    sudo service mongod restart
    sudo service mongod status
   ```
   
   Set user and password for mongod:
   ```bash
    mongod
    
    >-------------
    use admin
    >
    switched to db admin
    >

    db.createUser(
     {
      user: "admin",
      pwd: "password",
      roles: [ { role: "dbOwner", db: "db-name" } ]
     }
    )
   ```

   Network Binding:
   ```
   sudo ufw allow 27017
   ```
   ```
   sudo ufw allow from your_trusted_server_ip/32 to any port 27017
   ```
   To verify the changes in firewall settings, type:
   ```
   sudo ufw status
   ```
   Open the MongoDB configuration file in the editor:
   ```
   sudo nano /etc/mongod.conf
    
    >-----------------------------------------------------------------
    # mongod.conf

    # for documentation of all options, see:
    #   http://docs.mongodb.org/manual/reference/configuration-options/

    # Where and how to store data.
    # network interfaces
    net:
        port: 27017
        bindIp: 127.0.0.1   
   ```

   Add your server's IP address to net.bindIp:
   ```
   # network interfaces  
   net:
    port: 27017
    bindIp: 127.0.0.1,your_trusted_server_ip
   ```
   And restart
   ```
   sudo service mongod restart
   ```

8. Check memory usage:
    ```bash
    htop
    ```