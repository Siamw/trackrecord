const express = require('express');
const router = express.Router();

const authHelpers = require('../../auth/_helpers');
const passport = require('../../auth/local');
const knex = require('../../db/connection');
const artistDB = require('../../db/artist');
const idEncoder = require('../../utils/idEncoder');
const appSettings = require('../../config/app');


const { check, query, body, param, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

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
  
var validateAdminArtistUpdateCreateReq = [
	authHelpers.adminLoginRequired,
	body('acttype').isIn(appSettings.actTypes).withMessage('that is not an act type'),
	body('genres[]').custom((val, { req, location, path }) => {
		return checkArrayValuesInList(req, location, path, "genres[]", appSettings.genres)
	}).withMessage("invalid genre type"),
	body('paymenttypes[]').custom((val, { req, location, path }) => {
		return checkArrayValuesInList(req, location, path, "paymenttypes[]", appSettings.paymentTypes)
	}).withMessage("invalid payment types"),
	body('website').isURL().withMessage("Not a valid url."),
	body('name').trim().isLength({max:30}).withMessage('Stage name length should be under 30'),
	body('phoneNumber').custom((val, {req, location, path }) => {
    return mobileFormConverter(val, req, location, "phoneNumber")
  }).withMessage('must be US phone number'),
	body('phoneNumber').isMobilePhone('en-US').withMessage('must be US phone number'),
	body('twitter').withMessage('must be a twitter username'),
	body('youtube').withMessage('must be an youtube video ID'),
	body('instagram').withMessage('must be an instagram username'),
	body('soundcloud').withMessage('must be an soundcloud username'),
	body('minpayrate').isInt(),
	//body('noticeTerm').isBoolean(),
	body('zipCode').isLength({min:5, max:5}).withMessage('zip code length must be 5'),
];

var toUpdateOrCreateData = (params, contactEmail, createByUserID, roleID) => {
  var data =  {
    acttype: params["acttypes[]"],
    genres:  params["genres[]"], // check for valid genres, and make into array
    paymenttypes:  params["paymenttypes[]"], // check for valid genres, and make into array
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

  if(roleID && params.status in appSettings.status) {
    data.status = params.status;
  }

    return data;
};

router.get('/artist/:artistID', authHelpers.adminLoginRequired, (req, res, next) => {
	var artistID = idEncoder.decode(req.params.artistID)[0];
	artistDB.getByID(artistID, {adminColumns : true})
	.then( (result) => {
		console.log(result);
		res.json(result);
	})
	.catch( (error) => {
		console.log(error);
		next(error);
	});
});

router.get('/artists',   [
	query('limit').isInt({ gt: 0, lt : 50 }).toInt(),
	query('offset').isInt({ min: 0 }).toInt(),
	authHelpers.adminLoginRequired,
  ],
  function (req, res, next) {

	const {
	  offset = 0,
	  limit = 20,
	} = matchedData(req);
  
	artistDB.gets({offset, limit})
	  .then(function(result){
			result.forEach(function (item){
				item.artistID = idEncoder.encode(item.artistID);
			});
	  
			res.render('adminListArtist',{
				artists : result
			});
	}).catch( (error) => {
	  	next(error);
	});
});

router.put('/admin/artist',validateAdminArtistUpdateCreateReq, (req, res, next) => {

	if (req.user.artistID == null) {
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
		source : { pointer : '/admin/artist' },
		title : 'admin artist signup errors',
		message : `There are ${errors.length} errors on the page : ` + messages,
		errors : errors
	  }));
	}
  
	var editData = toUpdateOrCreateData(req.body);
	editData.artistID = req.user.artistID;
  
	artistDB.edit(editData)
	.then((result) => {
	  res.jsonSuccess(result);
	}).catch((error) => {
	  next(error);
	});
});

router.post('/admin/artist', validateAdminArtistUpdateCreateReq, (req, res, next)  => {
	
	if (!req.body.userID) {		// not administrator's ID but real user's ID
		return next(new HttpBadRequest('User ID not exist'));
	}
	if (req.user.artistID) {
	  return next(new HttpBadRequest('Artist profile created'));
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
		source : { pointer : '/admin/artist' },
		title : 'artist signup errors',
		message : `There are ${errors.length} errors on the page : ` + messages,
		errors : errors
	  }));
	}
  
  
	  var insertData = toUpdateOrCreateData(req.body, req.user.email, req.user.userID);
	  artistDB.create(insertData)
	  .then((artistID) => {
		  return userDB.update(req.user.userID, {
			  artistID
		  })
	  }).then((result) => {
		  res.jsonSuccess({redirectUrl : "/"});
	  })
	  .catch(function(ex){
		return next(new ApiError({
		  status : 700,
		  source : { pointer : '/admin/artist' },
		  title : 'artist signup errors',
		  message : `There are ${errors.length} errors on the page : ` + messages,
		  errors : errors
		}));                                                                            
	  });
	  //new Promise 
});

module.exports = router;