const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const userDB = require('../db/user');
const init = require('./passport');
const artistDB = require('../db/artist');
const venueDB = require('../db/venue');

const authHelpers = require('./_helpers');

var fromCookieParameter = function (param_name) {
  return function (req) {
      return req.cookies[param_name];
  };
};

var opts = {};
opts.jwtFromRequest = fromCookieParameter("jwt");
opts.secretOrKey = 'Whatisthisdoingtome';

init();

passport.secretOrKey = opts.secretOrKey;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) { 

  userDB.getByID(jwt_payload.userID)
  .then((user) => {
    if (!user) 
      return done(null, false);

    if(user.artistID){
      return artistDB.getByID(user.artistID)
        .then(function(artist){
            console.log("found artist")
            user.artist = artist; 
            done(null, user);
        })
    }
    else if(user.venueID)
    {
      return venueDB.getByID(user.venueID)
      .then(function(venue){
          user.venue = venue; 
          done(null, user);
      })
    }
    else
      done(null, user);
  })
  .catch((err) => { 
    return done(err); }
  );
}));

module.exports = passport;