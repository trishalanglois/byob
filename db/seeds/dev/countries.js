const countriesData = require('../../../countriesData');

const createCountry = async (knex, country) => {
  const countryId = await knex('countries').insert({
    country_abbrev: country.alpha,
    country_name: country.name
  }, 'id');
};

exports.seed = async (knex) => {
  try {
    await knex('deaths').del()
    await knex('countries').del()

    let countriesPromises = countriesData.map(country => {
      return createCountry(knex, country)
    })
    return Promise.all(countriesPromises)
  } catch (error) {
    console.log(`Error seeding data: ${error}`)
  }
}