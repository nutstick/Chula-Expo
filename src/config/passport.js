// const _ = require('lodash');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const retrieveError = require('../tools/retrieveError');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const { User } = require('../models');

module.exports = {
  initialize: (passport) => {
    passport.serializeUser((user, done) => {
      done(null, {
        id: user.id,
        admin: user.admin,
      });
    });

    passport.deserializeUser((user, done) => {
      User.findById(user.id, (err, user) => {
        done(err, user);
      });
    });

    /**
     * Sign in using Email and Password.
     */
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      process.nextTick(() => {
        User.findOne({ email: email.toLowerCase() }, (err, user) => {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { msg: `Email ${email} not found.` });
          }
          user.comparePassword(password, (err, isMatch) => {
            if (err) { return done(err); }
            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { msg: 'Invalid email or password.' });
          });
        });
      });
    }));

    /**
     * OAuth Strategy Overview
     *
     * - User is already logged in.
     *   - Check if there is an existing account with a provider id.
     *     - If there is, return an error message. (Account merging not supported)
     *     - Else link new OAuth account with currently logged-in user.
     * - User is not logged in.
     *   - Check if it's a returning user.
     *     - If returning user, sign in and we are done.
     *     - Else check if there is an existing account with user's email.
     *       - If there is, return an error message.
     *       - Else create a new account.
     */

    /**
     * Sign in with Facebook.
     */
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        process.nextTick(() => {
          User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
              done(null, req.user);
            } else {
              User.findById(req.user.id, (err, user) => {
                if (err) { return done(err); }
                user.facebook = profile.id;
                user.tokens.push({ kind: 'facebook', accessToken });
                user.name = user.name || `${profile.name.givenName} ${profile.name.familyName}`;
                user.gender = user.gender || profile._json.gender;
                user.profile = JSON.stringify(user.profile ||
                  `https://graph.facebook.com/${profile.id}/picture?type=large`);
                user.save((err) => {
                  done(err, user);
                });
              });
            }
          });
        });
      } else {
        process.nextTick(() => {
          User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
              return done(null, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
              if (err) { return done(err); }
              if (existingEmailUser) {
                done(retrieveError(1));
              } else {
                const user = {};
                user.email = profile._json.email;
                user.facebook = profile.id;
                user.tokens = [{ kind: 'facebook', accessToken }];
                user.name = `${profile.name.givenName} ${profile.name.familyName}`;
                user.gender = profile._json.gender;
                user.profile = JSON.stringify(user.profile ||
                  `https://graph.facebook.com/${profile.id}/picture?type=large`);
                done(err, user);
              }
            });
          });
        });
      }
    }));

    passport.use(new FacebookTokenStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        process.nextTick(() => {
          User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
              done(null, req.user);
            } else {
              User.findById(req.user.id, (err, user) => {
                if (err) { return done(err); }
                user.facebook = profile.id;
                user.tokens.push({ kind: 'facebook', accessToken });
                user.name = user.name || `${profile.name.givenName} ${profile.name.familyName}`;
                user.gender = user.gender || profile._json.gender;
                user.profile = JSON.stringify(user.profile || `https://graph.facebook.com/${profile.id}/picture?type=large`);
                user.save((err) => {
                  done(err, user);
                });
              });
            }
          });
        });
      } else {
        process.nextTick(() => {
          User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
              return done(null, existingUser);
            }
            User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
              if (err) { return done(err); }
              if (existingEmailUser) {
                done(retrieveError(1));
              } else {
                const user = {};
                user.email = profile._json.email;
                user.facebook = profile.id;
                user.tokens = [{ kind: 'facebook', accessToken }];
                user.name = `${profile.name.givenName} ${profile.name.familyName}`;
                user.gender = profile._json.gender;
                user.profile = JSON.stringify(user.profile || `https://graph.facebook.com/${profile.id}/picture?type=large`);
                done(err, user);
              }
            });
          });
        });
      }
    }));

    /**
     * JWT Token
     */
    passport.use(new JwtStrategy({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeader(),
    }, (jwtPayload, done) => {
      process.nextTick(() => {
        User.findById(jwtPayload.sub, (err, user) => {
          setTimeout(() => {
            if (err) {
              return done(err, false);
            } else if (user) {
              done(null, user);
            } else {
              done(false, false);
            }
          }, 5000);
        });
      });
    }));

    /**
     * Sign in with Google.
     */
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        process.nextTick(() => {
          User.findOne({ google: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
              done(null, req.user);
            } else {
              User.findById(req.user.id, (err, user) => {
                if (err) { return done(err); }
                user.facebook = profile.id;
                user.tokens.push({ kind: 'google', accessToken });
                user.name = user.name || profile.displayName;
                user.gender = user.gender || profile._json.gender;
                user.profile = user.profile || profile._json.image.url;
                user.save((err) => {
                  done(err, user);
                });
              });
            }
          });
        });
      } else {
        process.nextTick(() => {
          User.findOne({ google: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
              return done(null, existingUser);
            }
            User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
              if (err) { return done(err); }
              if (existingEmailUser) {
                done(retrieveError(1));
              } else {
                const user = {};
                user.email = profile.emails[0].value;
                user.facebook = profile.id;
                user.tokens.push({ kind: 'google', accessToken });
                user.name = profile.displayName;
                user.gender = profile._json.gender;
                user.profile = profile._json.image.url;
                done(err, user);
              }
            });
          });
        });
      }
    }));
  },
};
