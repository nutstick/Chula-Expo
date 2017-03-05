# Getting Started

The easiest way to get started is to clone the repository:

### Get the latest snapshot

```
git clone --depth=1 https://github.com/nutstick/Chula-Expo.git myproject
# change directory
cd myproject
# install NPM dependencies
npm install
```

### Mongodb set up
if you aren't yet install [mongodb driver](https://www.mongodb.com/download-center#community), install it. And config `mongod.exe` path in `script/rundb.sh`

```sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../mongodb" && pwd )"
# config mongodb path here
"$your path\mongod.exe" --dbpath "$DIR"
```

run mongodb

```
sh ./script/rundb.sh
```

### Starting Server
if you aren't yet install [nodejs](https://nodejs.org/en/), install it. Start running your NodeJS with command
```
npm run start
```
