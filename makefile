# ==============================================================================
# Ubuntu 20.04 (LTS) x64.
#================ enable root ssh login
# sudo su root
# passwd root
# vim /etc/ssh/sshd_config
#  ## change “PermitRootLogin” to “yes”
# service sshd restart
#================ install rsync ===ubuntu 20.04 includes
# apt-get install rsync

#.envrc contains all the variable
include .envrc

# ==============================================================================
#SSH to remote
# ssh -i C:\\Users\\defiance\\.ssh\\gc\\id_rsa root@34.64.236.119
# apt-get install rsync
.PHONY:ssh-root
ssh-root:
	ssh -i ${SSHKEYLOCATION} root@${REMOTE_IP}

#upload all scripts and files to remote
.PHONY:deploy-all-script
deploy-all-script:
	rsync -rP --delete ./remote/ -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:/root/remote

#execute dockerdeploy.sh to install docker and docker-compose
.PHONY:deploy-setup
deploy-setup:
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		vim /root/remote/setup/dockerdeploy.sh +"set ff=unix" +wq \
		chmod +x /root/remote/setup/dockerdeploy.sh \
		&& bash /root/remote/setup/dockerdeploy.sh\
	'
#run docker-compose
.PHONY:deploy-production
deploy-production:
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		cd /remote/production && docker-compose up -d \
	'
#update containers
#delete old containers
#pull new containers
#run new containers
.PHONY:update-containers
update-containers:
	ssh -i ${SSHKEYLOCATION} -t  root@${REMOTE_IP} '\
	vim /root/remote/setup/updatecontainers.sh +"set ff=unix" +wq \
		chmod +x /root/remote/setup/updatecontainers.sh \
		&& bash /root/remote/setup/updatecontainers.sh\
	'

# ==============================================================================
# Building system
##backend Golang tidy
.PHONY:tidy
tidy:
	(cd backend; go mod tidy)
	(cd backend; go mod vendor)
	
## build-backend: build the Go backend binary and output to /bin/api
.PHONY: build-backend
build-backend:
	@echo 'Building Go Binary...'
	(cd backend/app;  GOOS=linux GOARCH=amd64  go build -o=./bin/api . )

## build-frontend: build the React frontend
.PHONY: build-frontend
build-frontend:
	@echo 'Building React File ...'
	(cd frontend;  cnpm install;  npm run build)