const express = require('express');
const favicon = require('serve-favicon');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const path = require('path');
const dotenv = require('dotenv');
const flash = require('express-flash');
const cors = require('cors');
// logger and utility
const logger = require('morgan');
const chalk = require('chalk');
// database and passport
const mongoose = require('mongoose');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
// SASS
const sass = require('node-sass-middleware');
// Route
// Passport Config
const passportConfig = require('./config/passport');
const popupTools = require('popup-tools');

// Load envirountment variables from .env file
dotenv.load({ path: '.env' });
// Set up MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗')); // eslint-disable-line no-console
  process.exit();
});

// Passport apply configuration
passportConfig.initialize(passport);

const app = express();

// Set Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'routes'));
app.set('view engine', 'ejs');
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
// use morgan to log requests to the console
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
// use body parser so we can get info from POST and/or URL parameters
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set favicon using serve-favicon at /public/favicon.icon
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
// Set '/public' as static Routes
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/components', express.static(path.join(__dirname, 'components'), { maxAge: 31557600000 }));
app.use('/pages', express.static(path.join(__dirname, 'pages'), { maxAge: 31557600000 }));
// app.use(express.static(__dirname, { maxAge: 31557600000 }));
// Error Foramt send
app.use(require('./tools/sendError'));

/**
 * Route
 */
// Login through Facebook
app.get('/auth/facebook/token', (req, res, next) => {
  passport.authenticate('facebook-token', (err, user) => {
    if (err) {
      return res.sendError(5, err);
    } else if (!user) {
      return res.sendError(24);
    } else if (!user.id) {
      // No User Exist in Database
      return res.send({
        success: false,
        errors: {
          code: 2,
          message: 'First time Signup, need to provied more data',
        },
        user,
      });
    }
    // Match user in database, go login
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.send({
        success: true,
        message: 'User already exist, login success.',
        results: {
          token: user.generateToken(),
        }
      });
    });
  })(req, res, next);
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile', 'user_about_me'] }));
app.get('/auth/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', (err, user) => {
    if (err) {
      return res.sendError(5, err);
    } else if (!user) {
      return res.sendError(24);
    } else if (!user.id) {
      // No User Exist in Database
      // req.session.user = user;
      return res.send(popupTools.popupResponse({
        success: false,
        errors: {
          code: 2,
          message: 'First time Signup, need to provied more data',
        },
        user,
      }));
    }
    // Match user in database, go login
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.send(popupTools.popupResponse({
        success: true,
        message: 'User already exist, login success.',
        results: {
          token: user.generateToken(),
        }
      }));
    });
  })(req, res, next);
});

/**
 * Route
 */
app.use('/', require('./routes'));

/**
 * Server run on localhost:3000
 */
app.listen(app.get('port'), (err) => {
  if (err) {
    throw err;
  }
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); // eslint-disable-line no-console
});


/**
 * Server run on https://localhost:3000

const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
https.createServer(options, app).listen(3000);
*/

module.exports = app;
