# Chula-Expo
Chulalongkorn Expo repository for application

##Getting Started

The easiest way to get started is to clone the repository:

### Get the latest snapshot

```
git clone --depth=1 https://github.com/nutstick/Chula-Expo.git myproject
```

Change directory

```
cd myproject
```

Install NPM dependencies

```
npm install
```

### Mongodb set up
if you aren't yet install [mongodb driver](https://www.mongodb.com/download-center#community), install it.

config `mongod.exe` path in `script/rundb.sh`

```sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../mongodb" && pwd )"
# config mongodb path here
"$your path\mongod.exe" --dbpath "$DIR"
```

run mongodb

```
./script/rundb.sh
```

### Keep NodeJS running
if you aren't yet install [nodejs](https://nodejs.org/en/), install it.

start running nodejs with
```
npm run start
```
