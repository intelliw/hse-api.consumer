# Energy Management API consumers 


## Cloud Build 

gcloud builds submit `
    --project=sundaya-dev `
    --tag asia.gcr.io/sundaya-dev/consumers-image . `    

# Shared 

these folders are mastered in `hsy-api-host` and shared with `hsy-api-consumer` through symlinks
(see hsy-api.deployment for scripts to create symlinks)

    src\environment 
    src\logger
    src\publishers
