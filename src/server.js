const express = require('express');
const favicon = require('serve-favicon');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
// logger and utility
const logger = require('morgan');
const chalk = require('chalk');
// database and passport
const mongoose = require('mongoose');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
// SASS
const sass = require('node-sass-middleware');

// Load envirountment variables from .env file
dotenv.load({ path: '.env' });

// Set up MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log(chalk.red('MongoDB connection error. Please make sure MongoDB is running.')); // eslint-disable-line no-console
  process.exit();
});

const app = express();

// Set up view engine
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('views engine', 'ejs');
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env')); // eslint-disable-line no-console
});
