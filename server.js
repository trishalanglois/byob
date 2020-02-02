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

//sets up the url and the overall function that is going to be deleting an entry when called.  Also declared that this is going to be an async function
app.delete('/api/v1/countries/:id/deaths/:deathId', async (request,response) => {
  //destructure the request to pull out the id and set that to a variable called "id"
  const { id } = request.params;
    // uses the id from the DELETE request and sets a variable for the id of that death being requested
  const { deathId } = request.params;
  //go into the database and find the table called 'deaths'.  Save that to the variable 'deaths', which will hold all the deaths
  const deaths = await database('deaths').select();
  //iterates through all the deaths from the databse and finds the death that matches the id, given the id used from the DELETE request.  Returns the death that matches the deathId from the DELETE request.
  const death = deaths.find(death => death.id === parseInt(deathId));
  //iterates through all the deaths and returns all the deaths that DO NOT match the deadId being used from the DELETE request.
  const remainingDeaths = deaths.filter(death => death.id !== parseInt(deathId));
  //iterates through all the deaths that did not match the deathId used in the DELETE request and only returns the ones that have an id that matches the country id (just called id) from the DELETE request
  const remainingDeathsByCountry = remainingDeaths.filter(death => death.country_id === parseInt(id))
  //goes into the deaths database, goes to the id column, finds the one that matches the deathId used from the DELETE request, and deletes that row, thus deleting that death from the database.
  await database('deaths').where('id', deathId).del();
  //checks to see if there was a death in this request, and if so, sets a successful status of 200, returning an array of the remaining deaths for the country being used in the DELETE request.  If there is not a death that was correctly found, will set an error status of 400, indicating that there was a user error, and returning an error object with a message saying that a death was not found with the id being used for the DELETE request.
  death ? response.status(200).json({ remainingDeathsByCountry }) : response.status(400).json({ error: `Unable to find a death that with an ID of ${deathId}. Please choose another death.` });
})

//sets up the url and the overall function that is going to add a response to the database when it's called
app.post('/api/v1/countries', (request, response) => {
  //creates a variable called 'country' with the value being the body of the response object that a user will send in via some sort of event
  const country = request.body;
  // declares that there are two required parameters in the response body -- country_abbrev and country_name and stores their specific values in requiredParameter
  for (let requiredParameter of ['country_abbrev', 'country_name']) {
    // if one of the requiredParameters is missing, it will trigger this conditional
    if (!country[requiredParameter]) {
      //sets an error status 422 and sends a response that is an error object with the message that will tell the user which of the requiredParameters they're missing
      return response.status(422).send({ error: `Expected format: { country_abbrev: <String>, country_name: <String>}.  You're missing a ${requiredParameter} property.`})
    }
  }

  //goes into the database, finds the one called 'country', then inserts a new entry -- the first argument (country, which is the request object being stored in the variable earlier) is what we are giving the .insert() method, and the second ('id', which matches one of the columns in the table) is what it will return.  In this case, we will be giving it the country, and we will be receiving the id of said country from .insert()
  database('countries').insert(country, 'id')
  // after .insert() is complete, and if there was a successful return of an id, the .then will run
  .then(countryId => {
    // after we receive the id from the country, we are going to set the successful response status, and the response body will be the country that the user originally had in their request body
      response.status(201).json(country)
    })
    // if the .insert() was unsuccessful and does not return the id, the .catch() will run, indicating there was an error
    .catch(error => {
      // the .catch will set an error status of 500, returning the error object to the user
      response.status(500).json({ error })
    })
})

//sets up the url and the overall function that is going to add a response to the database when it's called
app.post('/api/v1/countries/:countryId/deaths', (request, response) => {
  //creates a variable called 'death' with the value being the body of the response object that a user will send in via some sort of event
  const death = request.body;
  //creates the countryId variable from the user's request, which will later be used in creating the death variable that will be added
  const { countryId } = request.params;
  // declares that there are two required parameters in the response body -- date and cause_of_death and stores their specific values in requiredParameter
  for (let requiredParameter of ['date', 'cause_of_death']) {
      // if one of the requiredParameters is missing, it will trigger this conditional
    if (!death[requiredParameter]) {
        //sets an error status 422 and sends a response that is an error object with the message that will tell the user which of the requiredParameters they're missing
      return response.status(422).send({ error: `Expected format: { date: <String>, cause_of_death: <String> }.  You're missing a ${requiredParameter} property.`})
    }
  }

  //creates a variable called deathToAdd that will be used later for the actual POST into the tables
  const deathToAdd = {
    //creates a key value pair, with the value being the countryId that was grabbed from the user's request.  This will act as the foreign key for the new death that we're creating, linking it to the first table/country in the other dataset
    country_id: countryId,
    //creates a key value pair, using the death date that the user entered in their original request body
    date: death.date,
    //creates a key value pair, using the death cause that the user entered in their original request body
    cause_of_death: death.cause_of_death
  }
  //goes into the database, finds the one called 'death', then inserts a new entry -- the first argument (deathToAdd, which was the object that was just created) is what we are giving the .insert() method, and the second ('id', which matches one of the columns in the 'deaths' table) is what it will return.  In this case, we will be giving it the death, and we will be receiving the id of said death from .insert()
  database('deaths').insert(deathToAdd, 'id')
    // after .insert() is complete, and if there was a successful return of an id, the .then will run
    .then(deathId => {
      // after we receive the id from the death, we are going to set the successful response status, and the response body will be the death object that we created using the information from the request
      response.status(201).json(death)
    })
      // if the .insert() was unsuccessful and does not return the id, the .catch() will run, indicating there was an error
    .catch(error => {
        // the .catch will set an error status of 500, returning the error object to the user
      response.status(500).json({ error })
    }) 
})

//when the app is successfully running on a port, this will be triggered
app.listen(app.get('port'), () => {
  //print the following message in the console, which tells us what port we are running on (will be 3000 when running locally)
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});