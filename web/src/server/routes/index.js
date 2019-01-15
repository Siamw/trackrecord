const express = require('express');
const router = express.Router();
const authHelper = require('../auth/_helpers');
const passport = require('../auth/local');
const indexController = require('../controllers/index');
const appSetting = require('../config/app');
const venueDB = require('../db/venue');
const artistDB = require('../db/artist');
const assetDB = require('../db/asset');
const idEncoder = require('../utils/idEncoder');
const multer = require('multer');
const s3 = require('multer-storage-s3');
const { getRedirectRoute } = require('../utils/routeUtil');

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }),
});

// var upload = multer({    //TODO : for uploading on S3, store it on buffer not on dist , must check file size!
//   storage: multer.memoryStorage(),
// });

const { HttpUnauthorized, HttpBadRequest, ApiError } = require('./httpError');
const { check, query, body, param, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');


var initEmptyVenueFields = function(venue){
  venue = venue || {};
  venue.venueTypes = venue.venueTypes || [];
  venue.actTypes = venue.actTypes || [];
  venue.paymentTypes = venue.paymentTypes || [];
  return venue;
};

var initEmptyArtistFields = function(artist){
  artist = artist || {};
  artist.venueTypes =  artist.venueTypes || [];
  artist.actTypes = artist.actTypes ||  [];
  artist.paymentTypes = artist.paymentTypes || [];
  return artist;
};

var getRenderObj = function(req){
  return  {user : req.user, appSetting};
}
;
var redirectIfCompletedStep = function(req, res, routePath) {
  if(req.isAuthenticated())
  {
    var redirectTo = getRedirectRoute(req.user, appSetting.roles);
    if(routePath && redirectTo.toLowerCase() !== routePath.toLowerCase())
    {
      res.redirect(redirectTo);
      return true;
    }
  }
  return false;
};
var loggedInRedirect = function(req, res) {
  if(req.isAuthenticated())
  {
    var redirectTo = getRedirectRoute(req.user, appSetting.roles);
    res.redirect(redirectTo);
    return true;
    
  }
  return false;
};

router.get('/test', function(req, res, next){
  const renderObject = {};
  res.render('uploadviewTest', renderObject);
});


var showArtistLandingPage = function(req, res)
{
  var data = getRenderObj(req);
  data.info = {
    howToSteps : [
      {
        title : "You create your profile", 
        reasons : ["Musical information", "Pricing", "Pictures", "Video"],
        imagePath : "/img/Artist_1.svg",
      },{
        title : "We match you with the right gig", 
        reasons : ["Venues", "Gigs", "Events"],
        imagePath : "/img/Artist_2.svg",
      },{
        title : "We handle the contracts", 
        reasons : ["Clear", "Scheduling", "Expectations", "Payments"],
        imagePath : "/img/Artist_3.svg",
      },{
        title : "You perform and get paid", 
        reasons : ["Build Musical Track Record", "Update", "Professionalism"],
        imagePath : "/img/Artist_4.svg",
      }
    ]
  }

  res.render('artistLanding', data)
}

var showVenueLandingPage = function(req, res)
{
  var data = getRenderObj(req);
  data.info = {
    howToSteps : [
      {
        title : "Tell us what you want.", 
        reasons : ["Genre", "Price", "Quality", "Fanbase"],
        imagePath : "/img/Venue_1.svg",
      },{
        title : "We prepare a list of artists matching your criteria.", 
        reasons : ["Artist", "Pricing", "Quality", "Fanbase"],
        imagePath : "/img/Venue_2.svg",
      },{
        title : "We prepare the contract", 
        reasons : ["Redundant Emailing", "Negotiation", "Scheduling", "Payments"],
        imagePath : "/img/Venue_3.svg",
      },{
        title : "We handle payment process", 
        reasons : ["Contracts", "Payment Method", "Payout"],
        imagePath : "/img/Venue_4.svg",
      }
    ]
  }

  res.render('venueLanding', data)
}

router.get('/how-it-works/venue', authHelper.login, function (req, res, next) {
  if(loggedInRedirect(req, res))
    return;

    showVenueLandingPage(req, res);
});

router.get('/', authHelper.login, function (req, res, next) {
  if(loggedInRedirect(req, res))
    return;
  //res.render('main', renderObject);
  showArtistLandingPage(req, res);
});
router.get('/how-it-works/artist', authHelper.login, function (req, res, next) {
  if(loggedInRedirect(req, res))
    return;

    showArtistLandingPage(req, res);
});

router.get('/signup/venue', authHelper.login, function (req, res, next) {
  if(loggedInRedirect(req, res))
    return;

  const renderObject = getRenderObj(req);
  renderObject.roleID = appSetting.roles.venueID;
  res.render('signup', renderObject);
});

router.get('/signup/artist', authHelper.login, function (req, res, next) {
  if(loggedInRedirect(req, res))
    return;

  const renderObject = getRenderObj(req);
  renderObject.roleID = appSetting.roles.artistID;
  res.render('signup', renderObject);
});

router.get('/signup', authHelper.login, function (req, res, next) {
  if(loggedInRedirect(req, res))
    return;

  res.render('signup', getRenderObj(req));
});

router.get('/signup/artist/step1', authHelper.loginRequired, function (req, res, next) {

  if(redirectIfCompletedStep(req, res, '/signup/artist/step1'))
    return;

  var artist = initEmptyArtistFields(req.user.artist);

  var renderObject = Object.assign({}, getRenderObj(req), {

    userInfo: artist,
    pageTitle : "Artist Signup - Step 1",
    submitMethod : hasCreatedArtist ? "PUT" : "POST"

  });
  res.render('artist/edit', renderObject);
});


router.get('/signup/artist/step2', authHelper.loginRequired, function (req, res, next) {

  if(redirectIfCompletedStep(req, res, '/signup/artist/step2'))
    return;
  
  var artist = initEmptyArtistFields(req.user.artist);

  var renderObject = Object.assign({}, getRenderObj(req), {

    userInfo: artist,
    pageTitle : "Signup - Step ",
    pageDescription : "Upload a photo of your act.",
    submitMethod : "POST",
    redirectUrlOnSuccess : "/"

  });
  res.render('asset/new', renderObject);
});

router.get('/signup/venue/step1', authHelper.loginRequired, function (req, res, next) {

  if(redirectIfCompletedStep(req, res, '/signup/venue/step1'))
    return;

  var hasCreatedVenue = req.user.venue != null;    
  var venue = initEmptyVenueFields(req.user.venue);

  var renderObject = Object.assign({}, getRenderObj(req), {
    userInfo: venue,
    pageTitle : "Venue Signup - Step 1",
    submitMethod : hasCreatedVenue ? "PUT" : "POST",
  });
  console.log(venue);
  res.render('venue/edit', renderObject);
});

router.get('/signup/venue/step2', authHelper.loginRequired, function (req, res, next) {

  if(redirectIfCompletedStep(req, res, '/signup/venue/step2'))
    return;
  
  var artist = initEmptyArtistFields(req.user.artist);

  var renderObject = Object.assign({}, getRenderObj(req), {

    userInfo: artist,
    pageTitle : "Signup - Step 2",
    pageDescription : "Upload a photo of your act.",
    submitMethod : "POST",
    redirectUrlOnSuccess : "/"

  });
  res.render('asset/new', renderObject);
});

router.get('/artistEdit', authHelper.loginRequired, function (req, res, next) {

  if(!req.user.artist)
    return next(new HttpBadRequest("No profile setup."));

  var renderObject = Object.assign({}, getRenderObj(req), {
    userInfo: initEmptyArtistFields(req.user.artist),
    pageTitle : "Edit your profile",
    submitMethod : "PUT"
  });
  
  res.render('artist/edit', renderObject);

});

router.get('/venueEdit', authHelper.loginRequired, function (req, res, next) {

  if(!req.user.venue)
    return next(new HttpBadRequest("No profile setup."));

  var renderObject = Object.assign({}, getRenderObj(req), {
    userInfo: initEmptyVenueFields(req.user.venue),
    pageTitle : "Edit your profile",
    submitMethod : "PUT"
  });
  
  res.render('venue/edit', renderObject);

});

router.get('/login', authHelper.login, function (req, res, next) {

  if(loggedInRedirect(req, res))
    return;
    
  const renderObject = {user : req.user, removeNavBarLinks : true};
  res.render('login', renderObject);
});

router.get('/emailConfirm', authHelper.login, function (req, res, next) {
  
  // check for email confirmed.

  if(redirectIfCompletedStep(req, res, '/emailConfirm'))
    return;
  
  const renderObject = getRenderObj(req);
  res.render('emailConfirm', renderObject);
});

router.get('admin/artist/:artistID', function(req, res, next) {
  var renderObject = getRenderObj(req);
  artistDB.getByID(req.params.artistID, {adminColumns: true})
  .then( (artist) => {
    renderObject.artist = artist;
    return assetDB.getByIDs(artist.assets);
  })
  .then(function(assets){
    renderObject.artist.assets = assets;
    console.log(renderObject);
    res.render('artist/show', renderObject);
  })
  .catch( (error) => {
    console.log(error);
    return next(new HttpBadRequest("Internal Server Error"));
  });
});

router.get('/artist/:artistID', authHelper.loginRequired, function (req, res, next) {
  const renderObject = getRenderObj(req);

  artistDB.getByID(idEncoder.decode(req.params.artistID)[0])
  .then( (artist) => {
    console.log(artist);
    renderObject.artist = artist;
    return assetDB.getByIDs(artist.assets);
  })
  .then(function(assets){
    renderObject.artist.assets = assets;
    console.log(renderObject);
    res.render('artist/show', renderObject);
  })
  .catch( (error) => {
    console.log(error);
    return next(new HttpBadRequest("Internal Server Error"));
  });
});

router.get('/venue/:venueID', authHelper.loginRequired, function (req, res, next) {
  const renderObject = getRenderObj(req);

  venueDB.getByID(idEncoder.decode(req.params.venueID)[0])
  .then( (venue) => {
    renderObject.venue = venue;
    return assetDB.getByIDs(venue.assets);
  })
  .then(function(assets){
    renderObject.venue.assets = assets;
    console.log(renderObject);
    res.render('venue/show', renderObject);
  })
  .catch( (error) => {
    console.log(error);
    return next(new HttpBadRequest("Internal Server Error"));
  });

  /*const renderObject = getRenderObj(req);
  artistDB.getByID(req.params.artistID)
  .then( (artist) => {
    renderObject.venue = venue;
    return assetDB.getByIDs(artist.assets);
  })
  .then(function(assets){
    renderObject.venue.assets = assets;
    console.log(renderObject);
    res.render('venue/show', renderObject);
  })
  .catch( (error) => {
    console.log(error);
    return next(new HttpBadRequest("Internal Server Error"));
  });*/
});

router.get('/artists', 
  [
    query('limit').isInt({ gt: 0, lt : 50 }).toInt(),
    query('offset').isInt({ min: 0 }).toInt(),
    authHelper.loginRequired,
  ],
function (req, res, next) {
  const {
    offset = 0,
    limit = 5, //요기가 한 페이지에 나열할 카드 수
  } = matchedData(req);
  
  var currentOffset = offset;
  var data = getRenderObj(req);
  artistDB.gets({
    offset,
    limit
  })
  .then(function(result){
    result.forEach(function (item){
      item.artistID = idEncoder.encode(item.artistID);
      item.idx = currentOffset++;
    });
    data.venues = result;
    return venueDB.getCount();
  })
  .then(function(result){
    var totalItems = result[0].count;
    var nextOffset = offset + limit;
    var prevOffset = offset - limit;
    data.paging = {
      next : nextOffset < totalItems ? `/artists?limit=${limit}&offset=${nextOffset}` : null,
      previous : prevOffset >= 0 ? `/artists?limit=${limit}&offset=${prevOffset}` : null,
    };
    res.render('artist/list', data);
  })
  .catch(function(err){
    next(err);
  });
});

router.get('/venues', 
  [
    query('limit').isInt({ gt: 0, lt : 50 }).toInt(),
    query('offset').isInt({ min: 0 }).toInt(),
    authHelper.loginRequired,
  ],
function (req, res, next) {
  const {
    offset = 0,
    limit = 5, //요기가 한 페이지에 나열할 카드 수
  } = matchedData(req);
  
  var currentOffset = offset;
  var data = getRenderObj(req);
  venueDB.gets({
    offset,
    limit
  })
  .then(function(result){
    result.forEach(function (item){
      item.venueID = idEncoder.encode(item.venueID);
      item.idx = currentOffset++;
    });
    data.venues = result;
    return venueDB.getCount();
  })
  .then(function(result){
    var totalItems = result[0].count;
    var nextOffset = offset + limit;
    var prevOffset = offset - limit;
    data.paging = {
      next : nextOffset < totalItems ? `/venues?limit=${limit}&offset=${nextOffset}` : null,
      previous : prevOffset >= 0 ? `/venues?limit=${limit}&offset=${prevOffset}` : null,
    };
    res.render('venue/list', data);
  })
  .catch(function(err){
    next(err);
  });
});

router.get('/admin/venue/:venueID', authHelper.loginRequired, function(req, res, next) {
  var str_id = req.params.venueID;
  var id = parseInt(idEncoder.decode(str_id)[0]);
  var renderObject = getRenderObj(req);

  venueDB.getByID(id)
  .then( (venue) => {
    renderObject.venue = venue;
    return assetDB.getByIDs(venue.assets);
  })
  .then(function(assets){
    renderObject.venue.assets = assets;
    res.render('venue/show', renderObject);
  })
  .catch( (error) => {
    next(error);
  });
});

router.get('/admin/artists', 
  [
    query('limit').isInt({ gt: 0, lt : 50 }).toInt(),
    query('offset').isInt({ min: 0 }).toInt(),
    authHelper.loginRequired,
  ],

function (req, res, next) {
  const {
    offset = 0,
    limit = 20,
  } = matchedData(req);
  
  var data = {};
  artistDB.gets({
    offset,
    limit,
    adminColumns: true,
  })
  .then(function(result){
    result.forEach(function (item){
      var s=item.phoneNumber;
      var s2 = (""+s).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      item.artistID = idEncoder.encode(item.artistID);      
      item.phoneNumber=(!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    });
    data.artists = result;
    return artistDB.getCount();
  })
  .then(function(totalItems){
    var nextOffset = offset + limit;
    var prevOffset = offset - limit;
    data.paging = {
      next : nextOffset > totalItems ? `/artistList?limit=${limit}&offset=${nextOffset}` : null,
      previous : prevOffset < 0 ? `/artistList?limit=${limit}&offset=${prevOffset}` : null,
      user : req.user
    };
    console.log(data);
    res.render('admin/artist/list', data);
  })
  .catch(function(err){
    next(err);
  });
});

router.get('/admin/venues', 
  [
    query('limit').isInt({ gt: 0, lt : 50 }).toInt(),
    query('offset').isInt({ min: 0 }).toInt(),
    authHelper.loginRequired,
  ],

function (req, res, next) {
  const {
    offset = 0,
    limit = 20,
  } = matchedData(req);
  
  var data = {};
  venueDB.gets({
    offset,
    limit
  })
  .then(function(result){
    result.forEach(function (item){
      var s=item.phoneNumber;
      var s2 = (""+s).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      item.venueID = idEncoder.encode(item.venueID);      
      item.phoneNumber=(!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    });
    data.venues = result;
    return venueDB.getCount();
  })
  .then(function(totalItems){
    var nextOffset = offset + limit;
    var prevOffset = offset - limit;
    data.paging = {
      next : nextOffset > totalItems ? `/venueList?limit=${limit}&offset=${nextOffset}` : null,
      previous : prevOffset < 0 ? `/venueList?limit=${limit}&offset=${prevOffset}` : null,
      user : req.user
    };
    res.render('admin/venue/list', data);
  })
  .catch(function(err){
    next(err);
  });
});


router.get('/admin',authHelper.adminLoginRequired, (req, res, next) => {
  const renderObject = {user : req.user};
  res.render('admin/index', renderObject);
});

router.post('/upload',
//[authHelper.loginRequired, upload.array('img')],  // TODO : after testing this function require login auth
upload.single('File'),   // store the files on disk(change it to be stored on buffer)
   function(req, res, next) {
    console.log(req.file);
});

router.get('/admin/artist/step1', authHelper.adminLoginRequired, function (req, res, next) {

  var artist = initEmptyArtistFields(req.user.artist);  // req.user = admin , req.user.artist = null (reference local.js file)

  var renderObject = Object.assign({}, getRenderObj(req), {

    userInfo: artist,
    pageTitle : "Admin Artist Creation - Step 1",
    submitMethod : "POST",
    redirectUrlOnSuccess : "/admin/artist/step2"

  });
  res.render('artist/edit', renderObject);
});

router.get('/admin/artist/step2', authHelper.adminLoginRequired, function (req, res, next) {
  
  var artist = initEmptyArtistFields(req.user.artist);

  var renderObject = Object.assign({}, getRenderObj(req), {

    userInfo: artist,
    pageTitle : "Admin Artist Creation - Step 2",
    pageDescription : "Upload a photo of your act.",
    submitMethod : "POST",
    redirectUrlOnSuccess : "/"  // TODO : change this route into that artist profile page or artist list page

  });
  res.render('asset/new', renderObject);
});

// router.get('/admin/artist/step1', authHelper.adminLoginRequired, function (req, res, next) {
//   var renderObject;
//   if(req.user.artist){
//     var artist = initEmptyArtistFields(req.user.artist);

//     renderObject = Object.assign({}, getRenderObj(req), {

//       userInfo: artist,
//       pageTitle : "Admin Artist Modification - Step 1",
//       submitMethod : "PUT"
//     });
//     res.render('artist/admin_edit', renderObject);
//   }
//   else{
//     res.render('venues',renderObject); // not found!
//   }
// });

module.exports = router;
