const countriesData = require('./countriesData');
const deathsData = require('./deathsData');


//input countries array  -- map
// create new object for each country
// create new key with deaths in that country 
// if no key exists yet, make "death" key, then push death object into it, maybe cleaning it here, too?
//output countries array of same length

const cleanedData = () => {
  return countriesData.map(country => {
    return {
      name: country.name,
      alpha: country.alpha,
      deaths: []
    }
  })
} 


//separate function to push deaths into object?

module.exports = cleanedData();