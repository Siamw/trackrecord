const knex = require('./connection');
const bcrypt = require('bcryptjs');
const tableName = 'public.user';
const columns = [

];

const salt = bcrypt.genSaltSync();


function getByID(userID)
{
	return knex(tableName).where({ userID: userID }).first();
}

function getByUsername(username) {
	// there should be a lowerCase index on username
	
	return knex(tableName).where({ username: username.toLowerCase() }).first();
}

function getByEmail(email) {
	return knex(tableName).where({ email: email}).first();
}


function create({password, roleID, email, email_confirmation_token, username, emailVerifiedTime}){
	const passwordHash = bcrypt.hashSync(password, salt);

	return knex(tableName)
		.returning("*")
		.insert({
			passwordHash,
			roleID,
			createTime: knex.fn.now(),
			email,
			email_confirmation_token,
			emailVerifiedTime,
			username
		}).then(function (users) {    
			return users[0];
		});
}

function update(userID, update){
	return knex(tableName).update(update).where({
		userID: userID
	  });
}

module.exports = {
    getByUsername,
	getByID,
	getByEmail,
	create,
	update
};