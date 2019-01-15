const express = require('express');
const router = express.Router();
const knex = require('../../db/connection');
const conditions = require('../../config/app');

const authHelpers = require('../../auth/_helpers');
const venueDB = require('../../db/venue');
const artistDB = require('../../db/artist');
const assetDB = require('../../db/asset');
const idEncoder = require('../../utils/idEncoder');
const randommer = require('randomstring');

const multer = require('multer');
const s3 = require('multer-storage-s3');
const { HttpUnauthorized, HttpBadRequest, ApiError } = require('../httpError');
const fixed_url = process.env.DEFAULT_URL+process.env.S3_BUCKET+'/';

var storage_info = s3({
	destination : function(req, file, cb) {
		cb(null, '');
	},
	filename : function(req, file, cb) {
		//cb(null, idEncoder.encode(req.user.userID+Date.now()));		// use randomstring module(.generate(7~8))
		cb(null, randommer.generate(16));
	},
	bucket : process.env.S3_BUCKET,
	region : process.env.AWS_REGION,
	secretAccessKey : process.env.AWS_SECRET_KEY,
	accessKeyId : process.env.AWS_ACCESS_KEY_ID
});

/*
const filter_func = function (req, file, cb) {
	if(!conditions.image.file_type.includes(file.mimetype)){	// TODO : change it as a Error object
		return cb(null, false, new Error('not valid file type!'));
	}
	return cb(null, true);
};
*/

const upload = multer({ storage: storage_info
	// limits: {fileSize : conditions.image.max_size},
	// fileFilter : filter_func
	});

router.get('/asset', authHelpers.loginRequired, (req, res, next) => {
	var url_list = [];
	assetDB.gets()
	.then((result)=>{
		result.forEach((item)=>{
			url_list.push(item.url);
		})
		res.jsonSuccess({'length' : result.length , 'urls' : url_list});
	})
})

router.post('/asset', [authHelpers.loginRequired, upload.single('File')], (req, res, next) => {
	console.log(req.file);
	if(conditions.image.max_size <= req.file.size){
		//do resize work!
		console.log('too big file size')
		return next(new ApiError({
			status : 700,
			source : { pointer : '/asset' },
			title : 'Too big file size',
			message : `Your file size : ` + req.file.size + 'maximum file size : ' + conditions.image.max_size,
			errors : null
		  }))
	}
	if(!conditions.image.file_type.includes(req.file.mimetype)){	// TODO : change it as a Error object
		//do something!
		console.log('not valid mime type')
		return next(new ApiError({
			status : 700,
			source : { pointer : '/asset' },
			title : 'Not a image file',
			message : `Available file type list :` + conditions.image.file_type,
			errors : null
		  }))
	}
	if(!conditions.image.type.includes(req.query.type)){
		console.log('not valid type');
		return next(new ApiError({
			status : 700,
			source : { pointer : '/asset' },
			title : 'Not valid file type',
			message : `Available type list :` + conditions.image.type,
			errors : null
		  }))
	}
		
	//make parameter
	var params = {};
	params.fileName = req.file.filename;
	params.fileSize = req.file.size;
	params.url = fixed_url + params.fileName;
	params.mediaType = req.file.mimetype;
	params.createByUserID = req.user.userID;
	
	var return_obj = {};
	assetDB.create(params)
	.then((asset_result)=>{
		return_obj.assetID = idEncoder.encode(asset_result[0].assetID);
		return_obj.url = asset_result[0].url;
		var assetID = asset_result[0].assetID;


		if(req.user.roleID == conditions.roles.venueID){
			return venueDB.addAssetID(req.user.venueID, assetID)
		}
		else if(req.user.roleID == conditions.roles.artistID){
			return artistDB.addAssetID(req.user.artistID, assetID)
		}
		else if(req.user.roleID == conditions.roles.adminID){
			return true;
		}
		else {
			throw new ApiError({
				status : 700,
				source : { pointer : '/asset' },
				title : 'You do not have the proper role.',
				message : `You do not have the proper role.`,
				errors : null
			  })
		}
	})
	.then((result)=>{
		res.jsonSuccess(return_obj);
	})
	.catch((err)=>{
		next(err);
	})
});

module.exports = router;