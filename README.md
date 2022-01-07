# conduit-fullstack

# local dev containers,frontend, backend,db
# root dir
docker-compose up 

# local dev containers, backend,db 
# ./backend
docker-compose up
# ./frontend
npm run dev


# keyfile.json needs to be placed in remote/setup folder
# .envrc needs variables 
      export REMOTE_IP=<REMOTE_IP>
      export SSHKEYLOCATION=<SSHKEYLOCATION>
      export BACKEND_IMAGE=<IMAGE_NAME>
      export FRONTEND_IMAGE=<IMAGE_NAME>

# server deployment
1. push to github main repo
2. github action: auto create FRONTEND and BACKEND images
3. github action: auto push to Google Container Registry
4. setup server env with make command
      1. make deploy-all-script
      2. make deploy-setup
      3. deploy-production
   
    ** When need to deploy new images
      1. make update-containers
