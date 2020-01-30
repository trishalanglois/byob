
exports.up = function(knex) {
  return knex.schema
    .createTable('deaths', table => {
      table.increments('id').primary();
      table.string('date');
      table.string('cause_of_death');
      table.integer('country_id').unsigned();
      table.foreign('country_id').references('countries.id');
      table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema 
    .dropTable('deaths')
    .dropTable('countries')
};

