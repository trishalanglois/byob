
exports.up = function(knex) {
  return knex.schema
    .createTable('countries', table => {
      table.increments('id').primary();
        table.string('country_abbrev');
        table.string('country_name');
        table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema 
    .dropTable('deaths')
    .dropTable('countries')
};
