const passport = require('passport');
const knex = require('../db/connection');

module.exports = () => {

  passport.serializeUser((user, done) => {
    done(null, user.userID);
  });

  passport.deserializeUser((userID, done) => {
    knex('user').where({userID}).first()
    .then((user) => { done(null, user); })
    .catch((err) => { done(err,null); });
  });

};