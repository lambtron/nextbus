require('../app/models/pset');

var mongoose = require('mongoose')
  , database = require('../config/database')
  , Pset = mongoose.model('Pset')
  , moment = require('moment');

mongoose.connect(database.url);

function removeUncheckedPsets () {
  var oneMonthAgo = moment().subtract('months', 1).toDate();
  Pset.find({last_checked_on: {$lt: oneMonthAgo}}).remove();
}

removeUncheckedPsets();