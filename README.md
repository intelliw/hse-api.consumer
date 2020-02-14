# Energy Management API Host

# GIT
https://github.com/intelliw/hsy-api.host

git add . ; git commit -m "ok" ; git push origin master ; git push origin --tags


## Cloud Build 

gcloud builds submit `
    --project=sundaya-dev `
    --tag asia.gcr.io/sundaya-dev/consumers-image . `    

# Shared Symlnks

`hsy-api-consumer` shares the following folders mastered in `hsy-api-host` through symlinks
(see hsy-api.deployment for scripts to create symlinks)

    src\environment 
    src\logger
    src\publishers
