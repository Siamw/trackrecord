const express = require('express');
const router = express.Router();

const authHelpers = require('../../auth/_helpers');
const passport = require('../../auth/local');
const artistDB = require('../../db/artist');
const userDB = require('../../db/user');
const appSettings = require('../../config/app');
const idEncoder = require('../../utils/idEncoder');
const { check, query, body, param, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const { HttpUnauthorized, HttpBadRequest, ApiError } = require('../httpError');
var validator = require('validator');


var checkArrayValuesInList = function(req, location, path, propName, list){
  var items = req[location][propName];
  if(typeof items === 'string' )
  {
    items = [items]
    req[location][propName] = items;
  }
  
  items.forEach(function(item){
    if(!validator.isIn(item, list))
      throw new Error('Invalid value');
  })
  return true;
}

var mobileFormConverter = function(val, req, location, propName){
  if(req[location][propName]){
    req[location][propName] = String(val).replace(/[^0-9]/g,'');
  }
  return true;
}

var validateArtistUpdateCreateReq = [ 
  authHelpers.loginRequired,
  body('actTypes[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "actTypes[]", appSettings.actTypes)
  }).withMessage('that is not an act type'),
  body('genres[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "genres[]", appSettings.genres)
  }).withMessage("invalid genre type"),
  body('paymentTypes[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "paymentTypes[]", appSettings.paymentTypes)
  }).withMessage("invalid payment types"),
  body('website').isURL().withMessage("Not a valid url."),//erase because we don't required......
  body('name').trim().isLength({max:30}).withMessage('Stage name length should be under 30'),
  body('phoneNumber').custom((val, {req, location, path }) => {
    return mobileFormConverter(val, req, location, "phoneNumber")
  }).withMessage('must be US phone number'),
  body('phoneNumber').isMobilePhone('en-US').withMessage('must be US phone number'),
  body('twitter').withMessage('must be a twitter username'),
  body('youtube').withMessage('must be an youtube video ID'),
  body('instagram').withMessage('must be an instagram username'),
  body('soundcloud').withMessage('must be an soundcloud username'),
  body('minpayrate').isInt().withMessage('write min pay rate'),
  //body('noticeTerm').isBoolean(),
  body('zipCode').isLength({min:5, max:5}).withMessage('zip code length must be 5'),
];


var toUpdateOrCreateData = (params, contactEmail, createByUserID, roleID) => {
  var data =  {
    actTypes: params["actTypes[]"],
    genres:  params["genres[]"], // check for valid genres, and make into array
    paymentTypes:  params["paymentTypes[]"], // check for valid genres, and make into array
    website: params.website, // check valid url
    name: params.name, // check max length
    phoneNumber: params.phoneNumber, // check is phonenumber
    //assets: req.body.assets, 
    contactEmail : params.contactEmail,
    youtube: params.youtube,
    twitter: params.twitter, // check is valid twitter url
    instagram: params.instagram, // check valid instagram url
    soundcloud: params.soundcloud,
    minpayrate: params.minpayrate,
    noticeTerm: params.noticeTerm || false, // check boolean
    zipCode: params.zipCode, // check valid zipcode
    canTravel: params.canTravel || false, // check boolean
    openMic: params.openMic || false, // check boolean
    over18: params.over18 || false, // check boolean
    equipment: params.equipment || false, // check boolean
    description: params.description,
  };

  if(!data.contactEmail){
    data.contactEmail = contactEmail;
  }

  if(createByUserID)
    data.createByUserID = createByUserID;

  if(roleID === appSettings.roles.adminID && params.status in appSettings.status) {
    data.status = params.status;
  }

    return data;
};

router.put('/artist',validateArtistUpdateCreateReq, (req, res, next) => { // admin can change status code

  var isAdmin = req.user.roleID == appSettings.roles.adminID 

  if (!isAdmin && req.user.artistID == null) {
    return next(new HttpUnauthorized(`Can't edit.`));
  }

  const errors = validationResult(req).array();

  if(errors.length > 0)
  {

    var messages = "";
    errors.forEach(element => {
      messages += (element.msg + ' ,  ');

    });
    return next(new ApiError({
      status : 700,
      source : { pointer : 'api/artist' },
      title : 'artist edit errors',
      message : `There are ${errors.length} errors on the page : ` + messages,
      errors : errors
    }));
  }

  var editData = toUpdateOrCreateData(req.body, null, null, (isAdmin)?roleID=req.user.roleID:roleID=null);  // admin can chagne status code
  
  if(isAdmin){
    var artistID = idEncoder.decode(req.body.artistID);
    editData.artistID = artistID;
  }
  else
    editData.artistID = req.user.artistID;

  artistDB.edit(editData)
  .then((result) => {
    res.jsonSuccess(result);
  }).catch((error) => {
    next(error);
  });

});

router.post('/artist', validateArtistUpdateCreateReq, (req, res, next)  => {
  
  var isAdmin;
  (req.user.roleID == appSettings.roles.adminID)?isAdmin=true:isAdmin=false;

  if (!isAdmin && req.user.artistID) {
    return next(new HttpBadRequest('You have already created a profile.'));
  }
  const errors = validationResult(req).array();
  if(errors.length > 0)
  {
    var messages = "";
    errors.forEach(element => {
      messages += (element.msg + ' ,  ');
    });
    return next(new ApiError({
      status : 700,
      source : { pointer : 'api/artist' },
      title : 'artist signup errors',
      message : `There are ${errors.length} errors on the page : ` + messages,
      errors : errors
    }));
  }

    var insertData = toUpdateOrCreateData(req.body, (isAdmin)?null:req.user.email, (isAdmin)?null:req.user.userID, req.user.roleID);
    artistDB.create(insertData)
    .then((artistID) => {
      console.log(isAdmin);
        if(isAdmin)
          return true;  // admin does not update the DB
        return userDB.update(req.user.userID, {
            artistID
        })
    }).then((result) => {
        res.jsonSuccess({redirectUrl : "/"});
    })
    .catch(next);
    //new Promise 
  });
module.exports = router;

