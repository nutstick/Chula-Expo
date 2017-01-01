# Code Integration

## Project Sturcture

Before you start, take a moment to see how the project structure looks like:

```
.
├── docs/                                # Documentation files for the project
├── mongodb/                             # Database holder for the project
├── node_modules/                        # 3rd-party libraries and utilities
├── script/                              # Script and Utilities
│   └── rundb.sh                         # Running MongodDB
├── src/                                 # The source code of the application
│   ├── config/                          # Configuration floader
│   │   ├── authenticate.js              # Authenticate middleware
│   │   ├── error.json                   # Error description
│   │   ├── passport.js                  # Passport configuration
│   │   └── retrieveError.js             # Error query
│   ├── models/                          # The folder for compiled output
│   │   ├── User/                        # The folder for compiled output
│   │   │   ├── index.js
│   │   │   └── User.test.js
│   │   └── ...
│   ├── public/                          # Static files
│   ├── routes/                          # Routing directories
│   │   ├── api/                         # Example API Router
│   │   │   ├── users/
│   │   │   │   ├── users.test.js
│   │   │   │   └── index.js
│   │   │   ├── ...
│   │   │   ├── api.test.js
│   │   │   └── index.js
│   │   ├── home/                        # Example Page Route
│   │   │   ├── home.view.ejs
│   │   │   └── index.js
│   │   ├── login/
│   │   ├── signup/
│   │   └── ...
│   └── server.js                        # Main entry
├── .env                                 # Custom Envirountment
├── .eslintrc.json                       # Eslint configuration
├── .gitignore
└── package.json                         # The list of 3rd party libraries and utilities
```