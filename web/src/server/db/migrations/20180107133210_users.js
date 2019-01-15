
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user', (table) => {
        table.increments('userID').primary();
        table.string('passwordHash', 100);
        table.integer('roleID');
        table.timestamp('loginTime');
        table.timestamp('createTime').defaultTo(knex.raw('now()'));
        table.string('email', 100);
        table.string('username', 30);
        table.timestamp('emailVerifiedTime');
        table.string('password_hash_algorithm', 10);
        table.integer('artistID');
        table.integer('venueID');
        table.string('email_confirmation_token', 100);
    });
};

exports.down = function(knex, Promise) {

};
