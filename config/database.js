'use strict';

// Server.js is going to retrieve database.url.
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

module.exports = {
	// The database url to connect.
	url: mongoUri
}