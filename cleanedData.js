const countriesData = require('./countriesData');
const deathsData = require('./deathsData');

const cleanedData = countriesData.map(country => { 
  let myDeaths = deathsData.filter(death => death.country === country.name);
  return {
    name: country.name,
    alpha: country.alpha,
    deaths: myDeaths
  }
})

module.exports = cleanedData;
