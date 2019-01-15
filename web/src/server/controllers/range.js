
function convertRangeToArray(range) {
    // convert range string to array

    var resultArray = [];
    var re = /(?:\-?\d*\.?)?\d+/g;

    resultArray = range.match(re);
    resultArray[0] = parseInt(resultArray[0]);
    resultArray[1] = resultArray[1]-1;
    return resultArray;
}

function convertArrayToRange(array) {
    var resultString = "";
    resultString = "[" + array.concat() + "]";
}

module.exports = {  //TODO : distinguish private function and public function and fix these export list
    convertRangeToArray,
    convertArrayToRange

}