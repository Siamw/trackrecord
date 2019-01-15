const knex = require('./connection');
const tableName = 'public.asset';
const columns = [
    'assetID',
    'fileName',
    'width',
    'height',
    'fileSize',
    'createTime',
    'url',
    'mediaType',
    'createByUserID'
    ];

function gets() {
    return knex.column(columns)
    .select().from(tableName);
}

function getByIDs(ids) {
    ids = ids || [];
    return knex.column(columns)
    .select().from(tableName)
    .whereIn('assetID', ids)
}

function getByID(id) {
    return knex.column(columns)
    .select().from(tableName)
    .where('assetID', id)
}

function create(params){
    var assetid;
	var insertData = {
        //width : params.width,
        //height : params.height,
        fileName : params.fileName,
        fileSize : params.fileSize,
        createTime : knex.fn.now(),
        url : params.url,
        mediaType : params.mediaType,
        createByUserID : params.createByUserID
    }
    return knex.insert(insertData).into("asset").returning(['assetID','url']);

    // return knex.insert(insertData).into("asset").returning("assetID","createByUserID") 
    // .then(function (IDs) {
    //     assetid = IDs[0];
    //     return knex("public.user")
    //         .select("artistID","venueID")
    //         .where("userID", IDs[1])
    // }).then(function (result){
    //     var tablename, tablecolumn, value;
    //     if(result[0] && !isNaN(result[0])){ // exist
    //         tablename = "public.artist";
    //         tablecolumn = "artistID"
    //         value = result[0];
    //     }
    //     else if(result[1] && !isNaN(result[1])){ // exist
    //         tablename = "public.venue";
    //         tablecolumn = "venueID";
    //         value = result[1];
    //     }
        
    //     if(tablename){
    //         return knex(tablename)
    //             .where(tablecolumn, value)
    //             .update({
    //                 'assets' : knex.raw('array_append(assets, ?)', assetid)
    //         }).returning("assetID", "url")
    //     }
    // }).then (function (result){
    //     results = {};
    //     results.assetID = result[0];
    //     results.url = result[1];
    //     return results;
    // })
}

module.exports = {
    gets,
    getByIDs,
    getByID,
    create
};