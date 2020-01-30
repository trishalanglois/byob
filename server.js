const express = require('express');
const app = express();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.json())

app.set('port', process.env.PORT || 3000);
app.locals.title = 'BYOB';

app.get('/', (request, response) => {
  response.send('Oh hey BYOB');
});

app.get('/api/v1/countries', async (request, response) =>  {
  try {
    const countries = await database('countries').select();
    response.status(200).json({ countries });
  } catch(error) {
    response.status(500).json({ error })
  }
})

app.get('/api/v1/countries/:id', async (request, response) => {
  const { id } = request.params;
  const countries = await database('countries').select();
  const country = countries.find(country => country.id === parseInt(id));

  country ? response.status(200).json(country) : response.status(404).json({ error: `Unable to find a country with the id of ${id}.  Please try again.`})
})

app.get('/api/v1/countries/:id/deaths', async (request, response) => {
  const { id } = request.params;
  const countries = await database('countries').select();
  const country = countries.find(country => country.id === parseInt(id));
  const deaths = await database('deaths').select();
  const countryDeaths = deaths.filter(death => death.country_id === parseInt(id))

  country && countryDeaths ? response.status(200).json(countryDeaths) : response.status(404).json({ error: `Unable to find deaths that match country id of ${id}.  Please try another country id.`})
})

app.get('/api/v1/countries/:id/deaths/:deathId', async (request, response) => {
  const { deathId } = request.params;
  const deaths = await database('deaths').select();
  const chosenDeath = deaths.find(death => death.id === parseInt(deathId));

  chosenDeath ? response.status(200).json(chosenDeath) : response.status(400).json( { error: `Unable to find a death that matches id ${deathId}. Please choose another death.`})
})

app.delete('/api/v1/countries/:id/deaths/:deathId', async (request,response) => {
  const { id } = request.params;
  const { deathId } = request.params;
  const deaths = await database('deaths').select();
  const death = deaths.find(death => death.id === parseInt(deathId));
  const remainingDeaths = deaths.filter(death => death.id !== parseInt(deathId));
  const remainingDeathsByCountry = remainingDeaths.filter(death => death.country_id === parseInt(id))

  death ? response.status(200).json({ remainingDeathsByCountry }) : response.status(400).json({ error: `Unable to find a death that matches ${deathId}. Please choose another death.` });
  
  app.locals.deaths = remainingDeaths;
})


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});