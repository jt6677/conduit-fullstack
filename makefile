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
#One command to deploy from scratch
.PHONY:deploy-all
deploy-all:
	@echo "deploy-script"
	make deploy-script
	@echo "deploy-backend"
	make deploy-backend
	@echo "deploy-frontend"
	make deploy-frontend
	@echo "deploy-api.service"
	make deploy-api.service
	@echo "deploy-caddyfile"
	make deploy-caddyfile

#Upload script to Remote
#Exectue script
#Saving script as unix first
#Gaining permission to execute
#Execute script
.PHONY:deploy-setup
deploy-setup:
	rsync -rP --delete ./remote/setup/ -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:/root/setup
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		vim /root/setup/dockerdeploy.sh +"set ff=unix" +wq \
		chmod +x /root/setup/dockerdeploy.sh \
		&& bash /root/setup/dockerdeploy.sh\
	'
.PHONY:deploy-production
deploy-production:
	rsync -rP --delete ./remote/production/ -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:/root/production
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		cd production && docker-compose up  \
	'

#Deploy Caddyfile
.PHONY:deploy-caddyfile
deploy-caddyfile:
	rsync -P ./remote/production/Caddyfile -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:~
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		sudo mv ~/Caddyfile /etc/caddy/ \
		&& sudo systemctl reload caddy \
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