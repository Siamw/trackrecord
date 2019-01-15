const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const randommer = require('randomstring');
const knex = require('../db/connection');
const passport = require('./local');
const userDB = require('../db/user');
const appSetting = require('../config/app');

const idEncoder = require('../utils/idEncoder');
const artistDB = require('../db/artist');
const venueDB = require('../db/venue');

const nunjucks = require('nunjucks');


function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function createUser (req, {username, email, password, roleID}, disableEmail) {
    



    /*
      Here we are configuring our SMTP Server details.
      STMP is mail server which is responsible for sending and recieving email.
    */
    var token=randommer.generate(15);
    if(!disableEmail)
    {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      var confirmEmailUrl=`${req.protocol}://${req.get('host')}/auth/verify?token=${token}&username=${username}`;
      var html = nunjucks.render('emailTemplates/verifyEmail.html', {user : {username}, confirmEmailUrl})

      const msg = {
        to: email,
        from: 'trackrecord@trackrecord.com',
        subject: 'Please verify your email address - TrackRecord',
        html : html,
      };    
      return sgMail.send(msg)
      .then(() => {
        console.log("Email Sent. Before Create");

        return userDB.create({
          password,
          roleID,
          email,
          email_confirmation_token: token,
          username
        });
      });
    }
    else
    {
      return userDB.create({
        password,
        roleID,
        email,
        email_confirmation_token: token,
        emailVerifiedTime : knex.fn.now(),
        username
      });   
    }
}

function login(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) { return next(err); }

    if(!user)
      return next();
      
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); }
      next();
    });
  })(req, res, next);
  
}

function loginRequired(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      if (!req.is('application/json')) {
        return res.redirect('/login'); 
      }else{
        return res.status(401).json({status: 'Please log in'});
      }
    }
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); }
      next();
    });
  })(req, res, next);
  
}

function adminLoginRequired(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      if (!req.is('application/json')) {
        return res.redirect('/login'); 
      } else{
        return res.status(401).json({status: 'Please log in'});
      }
    }
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      } else if (user.roleID !== appSetting.roles.adminID) {
        if (!req.is('application/json')) {
          return res.redirect('/login'); 
        } else{
          return res.status(401).json({status: 'Unauthorized Admin User'});
        }
      } else { // admin user here
        if(req.method == 'PUT' && req.data.artistID){ // TODO : delete req.method check & check req.data.artistID exist or not
          var id = idEncoder.decode(req.data.artistID);
          return artistDB.getByID(id)
          .then(function(artist){
              user.artist = artist; 
          })
        }
        else if(req.method == 'PUT' && req.data.venueID){ // TODO : delete req.method check & check req.data.veueID exist or not
          var id = idEncoder.decode(req.data.venueID);
          return venueDB.getByID(id)
          .then(function(venue){
              user.venue = venue; 
          })
        }
      }
      next();
    });
  })(req, res, next);
  
}

module.exports = {
  comparePass,
  createUser,
  loginRequired,
  adminLoginRequired,
  login,
};