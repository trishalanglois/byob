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
  console.log(app.locals);
  const country = countries.find(country => country.id === parseInt(id));

  country ? response.status(200).json(country) : response.status(404).json({ error: `Unable to find a country with the id of ${id}.  Please try again.`})
})



app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});