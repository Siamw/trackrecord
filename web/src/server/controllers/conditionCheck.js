const isPositive = require('is-positive');
const knex = require('../db/connection');

function isValidTable(tableName) {
    knex
    console.log(knex.table(tableName).columnInfo());
    //return knex('tableName'); true or false
}

function getColumns(tableName){
    if(isValidTable(tableName)){
        console.log(knex.table(public.tableName).colunInfo());
    }
    else{
        return null;
    }
}

function isValidColumn(columnName, tableName){
    var result = getColumns(tableName);
    if(result == null || !(columnName in result)){
        return false;
    }
    else
        return true;
}

function isValidDirection(sortDirection){
    if(isString(sortDirection)){
        if(sortDirection.toUpperCase() in ['ASC','DESC'])
            return true;
    }
    return false;
}

function getRowsNum(tableName){
    if (isValidTable(tableName)){
        return knex(tableName).count('*');
    }
    return null;
}

function isValidPageNum(pageNumber, items, tableName){
    if(isValidTable(tableName) && isPositive(pageNumber) && isPositive(items)){
        var total_count = getRowsNum(tableName);
        if (pageNumber * items < total_count)
            return true;
    }
    return false;
}

module.exports = {  //TODO : distinguish private function and public function and fix these export list
    isValidTable,
    getColumns,
    isValidColumn,
    isValidDirection,
    getRowsNum,
    isValidPageNum
}