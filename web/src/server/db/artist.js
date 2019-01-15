const knex = require('./connection');
const tableName = 'public.artist';
const columns = [
    'artist.artistID',
    'user.username',
    'genres',
    'actTypes',
    'paymentTypes',  
    'website',
    'name',
    'contactEmail',
    'phoneNumber', 
    'twitter',
    'instagram',
    'assets',
    'youtube',
    'minpayrate',
    'noticeTerm',  // TODO : change type as a boolean in database
    'canTravel',
    'zipCode',
    'openMic',
    'over18',
    'description',
    'equipment',
    'soundcloud',
    // 'statusCode',
];

const adminColumnNames = [   
    "assets",
    "email",
    "loginTime",
    "updateTime",
    "statusCode",
];
    //TODO : assets, createTime, updateTime, createByUserID, statusCode column is only for admin user  

function getCount()
{
    return knex(tableName).count('artistID');
}

function gets({offset = 0, isAsc = true, limit = 20, sortBy = 'name', adminColumns = false}) {
    return knex.column(adminColumns ? columns.concat(adminColumnNames) : columns)
    .select().from(tableName).rightJoin('user', 'artist.artistID', 'user.artistID')
    .orderBy(sortBy, isAsc ? 'asc' : 'desc')
    .offset( offset ).limit(limit);
}

function getByID(id, {adminColumns = false} = {}) {
    return knex.column(adminColumns ? columns.concat(adminColumnNames) : columns)
    .select().from(tableName).rightJoin('user', 'artist.artistID', 'user.artistID')
    .where('artist.artistID', id).first();
}

function toInsertOrUpdateData(params, isInsert){

    var makeList = function(obj){
        if(!obj)
            return null;
        
        return '{'+ obj +'}';
    }
    var data =  {
        genres: makeList(params.genres),
        actTypes: makeList(params.actTypes),
        website: params.website,
        name: params.name,
        contactEmail: params.contactEmail, 
        phoneNumber: params.phoneNumber, 
        
        updateTime: knex.fn.now(), 
        
        twitter: params.twitter, 
        instagram: params.instagram, 
        soundcloud : params.soundcloud,
        youtube : params.youtube,
        minpayrate: params.minpayrate, 
        paymentTypes : makeList(params.paymentTypes),
        zipCode: params.zipCode,
        canTravel: params.canTravel,
        noticeTerm : params.noticeTerm,
        openMic: params.openMic,
        over18: params.over18,
        equipment : params.equipment,
        description : params.description,
        // statusCode : params.statusCode || null,
    };

    if(isInsert){
        data.createByUserID = params.createByUserID;
        data.createTime = knex.fn.now();
    }

    return data;
}

function addAssetID(artistID, assetID){
    return knex(tableName)
    .where('artistID', artistID)
    .update({
        'assets' : knex.raw('array_append(assets, ?)', assetID )
    });
}
function create(params){
    var insertData = toInsertOrUpdateData(params, true)
    
    return knex.insert(insertData).into("artist").returning("artistID")
    .then(function (artistID) {    
        return artistID[0];
    });
}

function edit(params){
    var editData = toInsertOrUpdateData(params, false);
    return knex.update(editData).into("artist")
    .where('artistID', params.artistID).returning("artistID")
    .then( (count) => {
        return count > 0;
    });

}

module.exports = {
    getCount,
    gets,
    getByID,
    create,
    edit,
    addAssetID
};