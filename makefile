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
.PHONY:deploy-script
deploy-script:
	rsync -rP --delete ./remote/setup -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:/root
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		vim /root/setup/01.sh +"set ff=unix" +wq \
		chmod +x /root/setup/01.sh \
		&& bash /root/setup/01.sh \
	'
# ==============================================================================
#Deploy Go api to remote
.PHONY:deploy-backend
deploy-backend:
	@echo "building Go binary "
	make build-backend
	@echo "make remote folder"
	ssh -i ${SSHKEYLOCATION} root@${REMOTE_IP} mkdir -p /etc/www/backend/
	@echo "copying Go from local to server"
	rsync -rP --delete ./backend/app/bin/api -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:/etc/www/backend/
	@echo "gaining permission to api binary"
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP}	'\
	chmod u+x /etc/www/backend/api \
	'

#Deploy React frontend to remote
.PHONY:deploy-frontend
deploy-frontend:
	@echo "building frontend"
	make build-frontend
	@echo "make remote folder"
	ssh -i ${SSHKEYLOCATION} root@${REMOTE_IP} mkdir -p /etc/www/frontend
	@echo "copying React from local to server"
	rsync -rP --delete ./frontend/dist -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:/etc/www/frontend

#Upload api.service and make it run in background
.PHONY:deploy-api.service
deploy-api.service:
	rsync -P ./remote/production/api.service -e "ssh -i ${SSHKEYLOCATION}" root@${REMOTE_IP}:~
	ssh -i ${SSHKEYLOCATION} -t root@${REMOTE_IP} '\
		sudo mv ~/api.service /etc/systemd/system/ \
		&& sudo systemctl enable api \
		&& sudo systemctl restart api \
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