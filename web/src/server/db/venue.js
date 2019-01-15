const knex = require('./connection');
const rangeFunc = require("../controllers/range");
const tableName = 'public.venue';
const columns = [
    'venueID',
    'venueTypes',
    'actTypes',
    'genrePreferences',
    'website',
    'name',
    'contactEmail',
    'phoneNumber',
    'assets',
    'twitter',
    'instagram',
    'customerAge',
    'capacity',
    'payrate',
    'addressLine1',
    'addressLine2',
    'city',
    'region',
    'zipCode',
    'stageElevated',
    'equipment',
    'description',
    'paymentTypes',
];

const adminColumnNames = [    
    "assets",
    "loginTime",
    "updateTime",
    "statusCode",
];

function getCount()
{
    return knex(tableName).count('venueID');
}

function gets({offset = 0, isAsc = true, limit = 20, sortBy = 'name', adminColumns = false}) {
    return knex.column(adminColumns ? columns.concat(adminColumnNames) : columns)
    .select().from(tableName)
    .orderBy(sortBy, isAsc ? 'asc' : 'desc')
    .offset( offset ).limit(limit);
}

function getByID(id, {adminColumns = false} = {}) {
    return knex.column(adminColumns ? columns.concat(adminColumnNames) : columns)
    .select().from(tableName)
    .where('venueID', id).first()
    .then( (venue) => {
        console.log(rangeFunc.convertRangeToArray(venue.payrate));
        venue.payrate = rangeFunc.convertRangeToArray(venue.payrate);
        return venue;
    });
}

function toInsertOrUpdateData(params, isInsert){

    var makeList = function(obj){
        if(!obj)
            return null;
        
        return '{'+ obj +'}';
    }
    var data =  {
        venueTypes: makeList(params.venueTypes),
        genrePreferences: makeList(params.genrePreferences),
        actTypes: makeList(params.actTypes),
        website: params.website,
        name: params.name,
        contactEmail: params.contactEmail, 
        phoneNumber: params.phoneNumber, 
        updateTime: knex.fn.now(), 
        twitter: params.twitter, 
        instagram: params.instagram, 
        payrate: "[" + params.payrate + "]", 
        paymentTypes : makeList(params.paymentTypes), 
        customerAge : params.customerAge,
        region: params.region,
        city: params.city,
        zipCode: params.zipCode,
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,
        capacity: params.capacity,
        stageElevated: params.stageElevated,
        equipment: params.equipment,
        description : params.description,
    };

    if(isInsert){
        data.createByUserID = params.createByUserID;
        data.createTime = knex.fn.now();
    }

    return data;
}

function addAssetID(venueID, assetID){
    return knex(tableName)
    .where('venueID', venueID)
    .update({
        'assets' : knex.raw('array_append(assets, ?)', assetID )
    });
}

function create(params){
    var insertData = toInsertOrUpdateData(params, true);

    return knex.insert(insertData).into("venue").returning("venueID")
    .then( (venueID) => {
        return venueID[0];
    });
}

function edit(params){
    var editData = toInsertOrUpdateData(params, false);
    return knex.update(editData).into("venue")
    .where('venueID', params.venueID).returning("venueID")
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