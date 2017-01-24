// const _ = require('lodash');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const retrieveError = require('../tools/retrieveError');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
              user.pictureUrl = user.pictureUrl || `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.save((err) => {
                req.flash('info', { msg: 'Facebook account has been linked.' });
                done(err, user);
              });
            });
          }
        });
      } else {
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
              user.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
              done(err, user);
            }
          });
        });
      }
    }));

    passport.use(new FacebookTokenStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }, (accessToken, refreshToken, profile, done) => {
      if (req.user) {
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
              user.pictureUrl = user.pictureUrl || `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.save((err) => {
                req.flash('info', { msg: 'Facebook account has been linked.' });
                done(err, user);
              });
            });
          }
        });
      } else {
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
              user.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
              done(err, user);
            }
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
      User.findById(jwtPayload.sub, (err, user) => {
        if (err) {
          return done(err, false);
        } else if (user) {
          done(null, user);
        } else {
          done(false, false);
        }
      });
    }));

    /**
     * Sign in with Google.
     */
    // passport.use(new GoogleStrategy({
    //   clientID: process.env.GOOGLE_ID,
    //   clientSecret: process.env.GOOGLE_SECRET,
    //   callbackURL: '/auth/google/callback',
    //   passReqToCallback: true
    // }, (req, accessToken, refreshToken, profile, done) => {
    //   if (req.user) {
    //     User.findOne({ google: profile.id }, (err, existingUser) => {
    //       if (err) { return done(err); }
    //       if (existingUser) {
    //         req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
    //         done(err);
    //       } else {
    //         User.findById(req.user.id, (err, user) => {
    //           if (err) { return done(err); }
    //           user.google = profile.id;
    //           user.tokens.push({ kind: 'google', accessToken });
    //           user.profile.name = user.profile.name || profile.displayName;
    //           user.profile.gender = user.profile.gender || profile._json.gender;
    //           user.profile.picture = user.profile.picture || profile._json.image.url;
    //           user.save((err) => {
    //             req.flash('info', { msg: 'Google account has been linked.' });
    //             done(err, user);
    //           });
    //         });
    //       }
    //     });
    //   } else {
    //     User.findOne({ google: profile.id }, (err, existingUser) => {
    //       if (err) { return done(err); }
    //       if (existingUser) {
    //         return done(null, existingUser);
    //       }
    //       User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
    //         if (err) { return done(err); }
    //         if (existingEmailUser) {
    //           req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
    //           done(err);
    //         } else {
    //           const user = new User();
    //           user.email = profile.emails[0].value;
    //           user.google = profile.id;
    //           user.tokens.push({ kind: 'google', accessToken });
    //           user.profile.name = profile.displayName;
    //           user.profile.gender = profile._json.gender;
    //           user.profile.picture = profile._json.image.url;
    //           user.save((err) => {
    //             done(err, user);
    //           });
    //         }
    //       });
    //     });
    //   }
    // }));
  },
};

