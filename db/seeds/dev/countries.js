const cleanedData = require('../../../cleanedData');

// console.log('3', cleanedData[0]);

const createCountry = async (knex, country) => {
  const countryId = await knex('countries').insert({
    country_abbrev: country.alpha,
    country_name: country.name
  }, 'id');

  let deathPromises = country.deaths.map(death => {
    return createDeath(knex, {
      date: death.date,
      cause_of_death: death.cause,
      country_id: countryId[0]
    })
  })
  return Promise.all(deathPromises)
};

const createDeath = (knex, death) => {
  return knex('deaths').insert(death);
}

exports.seed = async (knex) => {
  try {
    await knex('deaths').del()
    await knex('countries').del()

    let countriesPromises = cleanedData.map(country => {
      return createCountry(knex, country)
    })
    return Promise.all(countriesPromises)
  } catch (error) {
    console.log(`Error seeding data: ${error}`)
  }
}