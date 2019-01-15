const bcrypt = require('bcryptjs');

exports.seed = (knex, Promise) => {
  return knex('user').del()
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync('johnson123', salt);
    return Promise.join(
      knex('user').insert({
        username: 'jeremy',
        password: hash
      })
    );
  });
};
