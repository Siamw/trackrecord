const express = require('express');
const router = express.Router();

const authHelpers = require('../../auth/_helpers');
const passport = require('../../auth/local');

const venueDB = require('../../db/venue');
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
    items = [items];
    req[location][propName] = items;
  }
  
  items.forEach(function(item){
    if(!validator.isIn(item, list))
      throw new Error('Invalid value');
  });
  return true;
};

var mobileFormConverter = function(val, req, location, propName){
  if(req[location][propName]){
    req[location][propName] = String(val).replace(/[^0-9]/g,'');
  }
  return true;
};

// TODO: Change for the venue columns
var validateVenueUpdateCreateReq = [ 
  authHelpers.loginRequired,
  body('venueTypes[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "venueTypes[]", appSettings.venueTypes);
  }).withMessage('that is not an venue type'),
  body('actTypes[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "actTypes[]", appSettings.actTypes);
  }).withMessage('that is not an act type'),
  body('genrePreferences[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "genrePreferences[]", appSettings.genres);
  }).withMessage("invalid genrePreferences type"),
  body('paymentTypes[]').custom((val, { req, location, path }) => {
    return checkArrayValuesInList(req, location, path, "paymentTypes[]", appSettings.paymentTypes);
  }).withMessage("invalid payment types"),
  body('website').isURL().withMessage("Not a valid url."),
  body('name').trim().isLength({max:30}).withMessage('Stage name length should be under 30'),
  body('phoneNumber').custom((val, {req, location, path }) => {
    return mobileFormConverter(val, req, location, "phoneNumber");
  }).withMessage('must be US phone number'),
  body('phoneNumber').isMobilePhone('en-US').withMessage('must be US phone number'),
  body('twitter').withMessage('must be a twitter username'),
  body('youtube').withMessage('must be an youtube video ID'),
  body('instagram').withMessage('must be an instagram username'),
  body('capacity').isInt().withMessage('Capcity value is invalid.'),
  body('zipCode').isLength({min:5, max:5}).withMessage('zip code length must be 5'),
];

// TODO: Change for the venue columns
var toUpdateOrCreateData = (params, contactEmail, createByUserID, roleID) => {
  var data =  {
    venueTypes: params["venueTypes[]"],
    actTypes: params["actTypes[]"],
    genrePreferences: params["genrePreferences[]"], // check for valid genres, and make into array
    name: params.name, // check max length
    paymentTypes:  params["paymentTypes[]"], // check for valid genres, and make into array
    payrate: params.payrate,
    contactEmail : params.contactEmail,
    region: params.region,
    city: params.city,
    zipCode: params.zipCode,
    addressLine1: params.addressLine1,
    addressLine2: params.addressLine2,
    capacity: params.capacity,
    customerAge: params.customerAge,
    stageElevated: params.stageElevated || false,
    equipment: params.equipment || false,
    phoneNumber: params.phoneNumber, // check is phonenumber
    website: params.website, // check valid url
    twitter: params.twitter, // check is valid twitter url
    instagram: params.instagram, // check valid instagram url
    description: params.description,
  };

  if(contactEmail){
    data.contactEmail = contactEmail;
  }

  if(createByUserID)
    data.createByUserID = createByUserID;

    return data;
};

router.put('/venue', validateVenueUpdateCreateReq, (req, res, next) => {
  
  if (req.user.venueID == null) {
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
      source : { pointer : 'api/venue' },
      title : 'venue edit errors',
      message : `There are ${errors.length} errors on the page : ` + messages,
      errors : errors
    }));
  }

  var editData = toUpdateOrCreateData(req.body);
  editData.venueID = req.user.venueID;

  venueDB.edit(editData)
  .then((result) => {
    res.jsonSuccess(result);
  }).catch((error) => {
    next(error);
  });

});

router.post('/venue', validateVenueUpdateCreateReq, (req, res, next) => {
  // TODO: create venue
  if(req.user.venueID) {
    return next(new HttpBadRequest('Venue profile already created'));
  }
  const errors = validationResult(req).array();
  console.log(errors);

  if(errors.length > 0)
  {
    var messages = "";
    errors.forEach(element => {
      messages += (element.msg + ' ,  ');
    });
    return next(new ApiError({
      status : 700,
      source : { pointer : 'api/venue' },
      title : 'venue signup errors',
      message : `There are ${errors.length} errors on the page : ` + messages,
      errors : errors
    }));
  }


    var insertData = toUpdateOrCreateData(req.body, req.user.email, req.user.userID, req.user.roleID);
    venueDB.create(insertData)
    .then((venueID) => {
        return userDB.update(req.user.userID, {
          venueID
        });
    }).then((result) => {
        res.jsonSuccess({redirectUrl : "/"});
    })
    .catch(next);
    //new Promise 

});

router.get('/venues', [
    query('limit').isInt({ gt: 0, lt: 50 }).toInt(),
    query('offset').isInt({ min: 0 }).toInt(),
    authHelpers.loginRequired,
  ],
  function (req, res, next) {
    const {
      offset = 0,
      limit = 20,
    } = matchedData(req);


    venueDB.gets(params)
      .then(function (result) {
        result.forEach(function (item) {
          item.venueID = idEncoder.encode(item.venueID);
        });
        res.jsonSuccess(result);
      });
  });

router.get('/venue', function (req, res, next) {
    //params = {};
    var str_id = req.query.venueid;
    var id = idEncoder.decode(str_id);

    if(isNaN(id) || id == 0)
      return next(new ApiError({
        status : 602,
        source : { pointer : '/route/api/venue/:venueid' },
        title : 'Invalid venue ID',
        message : 'venue ID do not match'
      }));


    venueDB.getByID(id)
      .then(function(result){

        if(result.length === 0) {
          throw new ApiError({
            status : 602,
            source : { pointer : '/route/api/venue/:venueID' },
            title : 'Invalid venue ID',
            message : 'venue ID do not match'
          })
        }
        else {
          result.venueID = str_id;
          res.jsonSuccess(result)
        }
    }).catch(function(err){
        next(err);
    });
})

  module.exports = router;