const Hashids = require('hashids');

const hashid_obj = new Hashids('supers@#@ecretkey11232@*@#', 8);

function encode(id /*int */){
	return hashid_obj.encode(id);
}

function decode(key){
	return hashid_obj.decode(key);
}
module.exports = {
	encode,
	decode
};