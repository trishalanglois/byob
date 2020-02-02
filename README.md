# Build Your Own Backend - American Deaths Abroad

## Description

Build Your Own Backend is a backend project that takes data from two separate databases - countries and deaths in said countries - and combines them into one dataset.  The database is built using PostgreSQL. From there, the data is seeded into two separate tables, which are used for endpoints that a frontend user can hit in order to gather and display the data.  The data is hosted on a server built with Node.js and Express, which allows the user to interact with the data using `GET`, `POST` and `DELETE`.

## Tech Stack
* Node.js 
* Express 
* Knex 
* PostgreSQL 

This app is also [deployed to Heroku](https://byob-death.herokuapp.com/api/v1/countries).  Use the following endpoints listed in the `Endpoints` section of this README to view additional data.

## Setup

* Clone down this repo and run `npm install`
* Run the server by using `npm start`

The server will run on `http://localhost:3000`. All endpoints are prefixed with `/api/v1`.

## Data Model

A country is stored on the server and has an `id`, `country_abbrev`, `name`, `created_at` and `updated_at`. `id`, `created_at` and `updated_at` are automatically created when an object is created.  Here is a sample country object:

```js
{
  id: 5662,
  country_abbrev: "NG",
  country_name: "Nigeria",
  created_at: "2020-01-29T23:32:33.555Z",
  updated_at: "2020-01-29T23:32:33.555Z"
}
```

A death is stored on the server and has an `id`, `date`, `cause_of_death`, `country_id` that refers back to the country it belongs to, `created_at` and `updated_at`.  `id`, `country_id`, `created_at`, `updated_at` are all automatically created when a user creates a death.  Here is a sample death object:

```js 
{
  id: 5777,
  date: "4/29/13",
  cause_of_death: "Air Accident",
  country_id: 5501,
  created_at: "2020-01-29T23:32:33.818Z",
  updated_at: "2020-01-29T23:32:33.818Z"
}
```

The countries are stored in one table, and the deaths are stored in another table on the server.  The data structure is set up with a one to many relationship, with a country holding many deaths (but each death only belonging to one country).

## Endpoints

There are two sets of endpoints, as follows:

### Countries
| Purpose | URL | Verb | Request Body | Sample Success Response |
|----|----|----|----|----|
| Get all countries |`/api/v1/countries`| GET | N/A | All countries on the server: `{countries: [{}, {}, ...]}` |
| Get one country |`/api/v1/countries/:id` | GET | N/A | One country: `{ id: 5509, country_abbrev: "AQ", country_name: "Antarctica", created_at: "2020-01-29T23:32:32.908Z", updated_at: "2020-01-29T23:32:32.908Z" } ` |
| Add new country |`/api/v1/countries`| POST | `{country_abbrev: <String>, country_name: <String>}` | New country that was added: `{country_abbrev: "ZZ", country_name: "SleepyCountry" }` |

### Deaths 
| Purpose | URL | Verb | Request Body | Sample Success Response |
|----|----|----|----|----|
| Get all deaths in a country | `/api/v1/countries/:id/deaths` | GET | N/A | All deaths for a country: `[{}, {} ... ]` | 
| Get specific death in a country | `/api/v1/countries/:id/deaths/:id` | GET | N/A | Specific death: `{id: 11455, date: "7/14/13", cause_of_death: "Homicide", country_id: 5738, created_at: "2020-01-29T23:32:36.101Z", updated_at: "2020-01-29T23:32:36.101Z"}` |
| Create a death | `/api/v1/countries/:id/deaths` | POST | `{date: "7/14/13", cause_of_death: "Drank too many Croix Boyz"}` | `{date: "7/14/13", cause_of_death: "Drank too many Croix Boyz"}` |
| Delete existing death |`/api/v1/countries/:id/deaths/:id`| DELETE | N/A | All remaining deaths for that country: `{ remainingDeathsByCountry: [{}, {}...] }` |

## Project Spec 
This was a solo project completed over the course of one week at Turing School of Software and Design.

[The project spec can be found here.](https://frontend.turing.io/projects/build-your-own-backend.html)

[This project used GitHub Projects project board.](https://github.com/trishalanglois/byob/projects/1)





