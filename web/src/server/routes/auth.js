const express = require('express');
const router = express.Router();

const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');
const knex = require('../db/connection');
const jwt = require('jsonwebtoken');
const { HttpUnauthorized, HttpBadRequest, ApiError } = require('./httpError');
const { check, query, body, param, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const userDB = require('../db/user');
const config = require('../config/app');
const { getRedirectRoute } = require('../utils/routeUtil');
//Register

var setAuthCookie = function(res, userID){
  var payload = {userID: userID, loginTime: new Date()};
  var token = jwt.sign(payload, passport.secretOrKey);
  res.cookie('jwt', token, 
    { httpOnly: false });
}

router.post('/register', 
  [
    body('username').trim().isLength({ min: 5, max: 15 }).withMessage('username length have to 5~15').isAlphanumeric(),
    body('email').isEmail().withMessage('must be an email').normalizeEmail(),
    body('password').trim().isLength({ min: 5, max:20 }).withMessage('password length have to 5~20'),
    body('roleID').isIn([1, 2]), 
  ],
  (req, res, next)  => {
    const errors = validationResult(req).array();
    if(errors.length > 0)
    {
      console.log(errors);
      var messages = "";
      errors.forEach(element => {
        messages += (element.msg + ' ,  ');
      });

      return next(new ApiError({
        status : 700,
        source : { pointer : '/register' },
        title : 'register errors',
        message : `There are ${errors.length} errors on the page : ` + messages,
        errors : errors
      }));
    }
    // TODO:
    // prevent register if the user has already created an account. user가 이미 계정이 있는가?
    // need to check if user is already loggedIn 이미 로그인중인가?
    // check for dupliate email address 유일한가
    // check for duplicate username 유일한가
    // check for min/max length of username *
    // check username has valid characters *
    // check min/max length of password *
    // check valid role type *
    // check email is valid. *
    const data = matchedData(req);
    // if false, the mail confirmation function works.
    authHelpers.createUser(req, data, false)
    .then((user) => {
        setAuthCookie(res, user.userID);
        var redirectTo = getRedirectRoute(user, config.roles);
        res.jsonSuccess({redirectUrl : redirectTo});
    }).catch((error) => { 
      // duplicate key
      if(error.code == 23505 && error.constraint === 'UK_user_username')
      {
        return next(new ApiError({
          status : 700,
          source : { pointer : '/register' },
          title : 'Username taken.',
          message : "Username taken",
          errors : [{param : 'username', msg : "Username already taken."}]
        }));
      }
      else if(error.code == 23505 && error.constraint === 'UK_user_email')
      {
        return next(new ApiError({
          status : 700,
          source : { pointer : '/register' },
          title : 'Email already used.',
          message : "Email already user",
          errors : [{param : 'email', msg : "Email already used."}]
        }));
      }

      next(error);
    });
});
//node js promise 
//promisejs.org
//login
router.post('/login', (req, res, next) => {

  if(!req.body.username || !req.body.password)
    return next(new HttpUnauthorized("User not found"));

  var username = req.body.username;
  var password = req.body.password;
  //.whereNotNull('emailVerifiedTime')
  var user = null;
  var userID = null;
  userDB.getByUsername(username)
  .then((u) => {
    user = u;
    if (!user) 
      throw new HttpUnauthorized("User not found.");

    userID = user.userID;
    return userDB.update(user.userID, {
      loginTime: knex.fn.now()
    });      
  }).then((updated) => {

    if(!authHelpers.comparePass(password, user.passwordHash))
    {
      throw new HttpUnauthorized("Password incorrect.");
    }

    setAuthCookie(res, userID)
    //var redirectTo = getRedirectRoute(user, config.roles);
    var redirectTo = "/login";
    res.jsonSuccess({redirectUrl : redirectTo});
     
  })
  .catch(next);

});
    

//logout
router.get('/logout', authHelpers.loginRequired, (req, res, next) => {
  // clear cookie
  req.logout();
  res.clearCookie("jwt");
  res.redirect('/');
});

//email verify
router.get('/verify',
  [
    query('token', "missing token").exists(),
    query('username', "missing username").exists(),
  ],
  function(req,res, next){    
      const errors = validationResult(req);
      if(errors.array().length > 0)
        return next(new HttpBadRequest("Invalid parameters"));

      const {
        token,
        username
      } = matchedData(req);
      userDB.getByUsername(username)
        .then(function (user) {
          if(!user)
            throw new HttpBadRequest("User not found.")

          if(user.email_confirmation_token && token != user.email_confirmation_token)
            throw new HttpBadRequest("Invalid token.")

          return userDB.update(user.userID, {
            emailVerifiedTime: knex.fn.now()
          })                 

        }).then(function(updated){
          res.redirect('/login');
        }).catch(function(err) {
          next(err);
        });
  });


module.exports = router;