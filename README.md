# Build Your Own Backend - American Deaths Abroad

Build Your Own Backend takes data from two separate databases - countries and deaths in said countries - and combines them into one dataset.  From there, the data is seeded into two separate tables, which are used for endpoints that a frontend user can hit in order to gather and display the data.

## Setup

* Clone down this repo and run `npm install`
* Run the server by using `npm start`

The server will run on `http://localhost:3000`. All endpoints are prefixed with `/api/v1`.

## Data Model

A country is stored on the server has an `id`, `country_abbrev`, `name`, `created_at` and `updated_at`. `id`, `created_at` and `updated_at` are automatically created when an object is greated.  Here is a sample country order object:

```js
{
  id: 5662,
  country_abbrev: "NG",
  country_name: "Nigeria",
  created_at: "2020-01-29T23:32:33.555Z",
  updated_at: "2020-01-29T23:32:33.555Z"
}
```

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

