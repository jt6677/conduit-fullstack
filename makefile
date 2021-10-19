# ==============================================================================
# Ubuntu 20.04 (LTS) x64.
#================ enable root ssh login
# sudo su root
# passwd root
# nano /etc/ssh/sshd_config
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
	ssh root@${REMOTE_IP}

.PHONY:ssh-user
ssh-user:
	ssh ${USER}@${REMOTE_IP}

#Upload script to Remote
.PHONY:send-script
send-script:
	rsync -rP --delete ./remote/setup  root@${REMOTE_IP}:/root

#Execute script uploaded previously
.PHONY:execute-script
execute-script:
	ssh -t root@${REMOTE_IP} "bash /root/setup/01.sh"

# ==============================================================================
#Deploy Go api to remote
.PHONY:deploy-backend
deploy-backend:
	@echo "building Go binary "
	make build-backend
	@echo "copying Go from local to server"
	rsync -rP --delete ./backend/app/bin/api root@${REMOTE_IP}:/etc/www/backend/
	@echo "gaining permission to api binary"
	ssh -t  root@${REMOTE_IP}	'\
	chmod u+x /etc/www/backend/api \
	'

#Deploy React frontend to remote
.PHONY:deploy-frontend
deploy-frontend:
	@echo "copying React from local to server"
	rsync -rP --delete ./frontend/build root@${REMOTE_IP}:/etc/www/frontend

#Upload api.service and make it run in background
.PHONY:depoly-api.service
depoly-api.service:
	rsync -P ./remote/production/api.service root@${REMOTE_IP}:~
	ssh -t root@${REMOTE_IP} '\
		sudo mv ~/api.service /etc/systemd/system/ \
		&& sudo systemctl enable api \
		&& sudo systemctl restart api \
	'
## production/configure/caddyfile: configure the production Caddyfile
.PHONY:deploy-caddyfile
deploy-caddyfile:
	rsync -P ./remote/production/Caddyfile root@${REMOTE_IP}:~
	ssh -t root@${REMOTE_IP} '\
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