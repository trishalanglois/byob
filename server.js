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

//sets up this url path and declares that this is going to be an async function
app.get('/api/v1/countries', async (request, response) =>  {
  //if the url is correct, do the following
  try {
    //go into the database and find the table called 'countries'.  Save that to the variable 'countries', which will hold all the countries
    const countries = await database('countries').select();
    //set the status code to 200, send a response body that will include a successful status code and return all the countries in the database
    response.status(200).json({ countries });
    //if something is incorrect about the request, do the following
  } catch(error) {
    //set the status code to an error of 500, send an error status code and include the error message as the body of the response
    response.status(500).json({ error })
  }
})

//sets up this url path and declares that this is going to be an async function
app.get('/api/v1/countries/:id', async (request, response) => {
  //destructure the request to pull out the id and set that to a variable called "id"
  const { id } = request.params;
   //go into the database and find the table called 'countries'.  Save that to the variable 'countries', which will hold all the countries
  const countries = await database('countries').select();
  //iterate through all the countries and find the one that matches the id that's being used for the GET request
  const country = countries.find(country => country.id === parseInt(id));
  // if there is a country, set the status to a successful 200 and send back the country that matched earlier as the response body.  If there's not a country, set the response status to an error and create an error object to include in the response body.  The message will let the FE dev know that there is not a country that matches the id from the original GET request.
  country ? response.status(200).json(country) : response.status(404).json({ error: `Unable to find a country with the id of ${id}.  Please try again.`})
})

//sets up this url path and declares that this is going to be an async function
app.get('/api/v1/countries/:id/deaths', async (request, response) => {
  //destructure the request to pull out the id and set that to a variable called "id"
  const { id } = request.params;
  //go into the database and find the table called 'countries'.  Save that to the variable 'countries', which will hold all the countries
  const countries = await database('countries').select();
    //iterate through all the countries and find the one that matches the id that's being used for the GET request
  const country = countries.find(country => country.id === parseInt(id));
  //go into the database and find the table called 'deaths'.  Save that to the variable 'deaths', which will hold all the deaths
  const deaths = await database('deaths').select();
  //iterate through all the deaths and find all of the ones that have a country id that match the country id being used for this request (thus, returning an array of all the deaths that belong to this country)
  const countryDeaths = deaths.filter(death => death.country_id === parseInt(id))

  //is there a country and does that country have deaths?  if so, set the response status to a successful 200, and then return a response body of the deaths that match this country.  If there is not a country with deaths, then set the status code to 400, and include an error object as the response body, which will provide a message saying there are no deaths that match the requested country.
  country && countryDeaths ? response.status(200).json(countryDeaths) : response.status(404).json({ error: `Unable to find deaths that match country id of ${id}.  Please try another country id.`})
})

//sets up this url path and declares that this is going to be an async function
app.get('/api/v1/countries/:id/deaths/:deathId', async (request, response) => {
  // uses the id from the GET request and sets a variable for the id of that death being requested
  const { deathId } = request.params;
    //go into the database and find the table called 'deaths'.  Save that to the variable 'deaths', which will hold all the deaths
  const deaths = await database('deaths').select();
  //iterate through all the deaths from the database and finds the one that matches, based on the id from the GET request and the id being stored for the death in the database
  const chosenDeath = deaths.find(death => death.id === parseInt(deathId));
  //checks to see if there is a chosen death that was found previously in the .find, and if so, sets a status code of 200, returning a response of the chosenDeath that was found in the database using .find().  If there is not a death that was found through iterating through using .find(), then it will set the status to an error of 400 and return a message that says there is no match given that id from the GET request.
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

app.get('*', (request, response) => {
  response.status(404).send('404: Not found');
});

app.delete('*', (request, response) => {
  response.status(404).send('404: Not found');
});

app.post('*', (request, response) => {
  response.status(404).send('404: Not found');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});