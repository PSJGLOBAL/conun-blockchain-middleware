#!/bin/bash
install() {
    sudo apt-get update
    sudo apt-get upgrade
    sudo apt install docker.io
    systemctl start docker
    systemctl enable docker
    docker --versio
}

# Switch user:    
#        sudo usermod -aG docker ${USER}
#        su - ${USER}
#        id -nG
#        sudo usermod -aG docker addusernamehere

build() {
    docker build --tag conun-middleware-testnet-v3:0.1 .
}

run() {
    docker run -d -p 4040:4040 -it conun-middleware-testnet-v3:0.1
}

stopAllContainers() {
    docker stop $(docker ps -aq)
}

deleteAllContainers() {
    docker rm $(docker ps -aq)
}

stopandDeleteAllContainers() {
    echo ">> stopandDeleteAllContainers"
    docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
}

deleteAllImages() {
    docker rmi -f $(docker images -a -q)
}


stopServer() {
    sudo kill -9 `sudo lsof -t -i:4040`

}


# install


## switch to user mode
# build
# run

# stopServer
# stopandDeleteAllContainers
# deleteAllImages



#docker ps
#docker logs <container id>
#  If you need to go inside a container exec, you can use a command:
# docker exec -it <container id> /bin/bash 