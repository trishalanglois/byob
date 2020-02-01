//brings in the express framework to use with Node
const express = require('express');
//creates our app
const app = express();
//creates the development that we'll use to run -- either for production (Heroku) or development
const environment = process.env.NODE_ENV || 'development';
//uses the .knexfile to determine the environment that we're going to use -- either production or development.  Also links the other things in our knexfile like migration and seed directories that will store those files when they're run
const configuration = require('./knexfile')[environment];
//creates our database using postgreSQL
const database = require('knex')(configuration);
//JSONs our app, which will be important for readability when we start adding things to our database through POST
app.use(express.json())
//creates the port where we're running our app -- either the production environment that we determined in our knexfile or on port 3000 when we're running it locally
app.set('port', process.env.PORT || 3000);
//creates the title of our database
app.locals.title = 'BYOB';
//creates a response body when you go to this url path
app.get('/', (request, response) => {
  //the response body when you go to this url path is this string
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
  
  await database('deaths').where('id', deathId).del();

  death ? response.status(200).json({ remainingDeathsByCountry }) : response.status(400).json({ error: `Unable to find a death that with an ID of ${deathId}. Please choose another death.` });

})

app.post('/api/v1/countries', (request, response) => {
  const country = request.body;
  for (let requiredParameter of ['country_abbrev', 'country_name']) {
    if (!country[requiredParameter]) {
      return response.status(422).send({ error: `Expected format: { country_abbrev: <String>, country_name: <String>}.  You're missing a ${requiredParameter} property.`})
    }
  }

  database('countries').insert(country, 'id')
    .then(countryId => {
      response.status(201).json(country)
    })
    .catch(error => {
      response.status(500).json({ error })
    })
})

app.post('/api/v1/countries/:countryId/deaths', (request, response) => {
  const death = request.body;
  const { countryId } = request.params;
  for (let requiredParameter of ['date', 'cause_of_death']) {
    if (!death[requiredParameter]) {
      return response.status(422).send({ error: `Expected format: { date: <String>, cause_of_death: <String> }.  You're missing a ${requiredParameter} property.`})
    }
  }

  const deathToAdd = {
    country_id: countryId,
    date: death.date,
    cause_of_death: death.cause_of_death
  }

  database('deaths').insert(deathToAdd, 'id')
    .then(deathId => {
      response.status(201).json(death)
    })
    .catch(error => {
      response.status(500).json({ error })
    }) 
})






app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});