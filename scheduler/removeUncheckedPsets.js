require('./app/models/pset');

var mongoose = require('mongoose')
  , database = require('./config/database')
  , Pset = mongoose.model('Pset')
  , moment = require('moment');

mongoose.connect(database.url);

// Go through the model
function removeUncheckedPsets () {
  Pset.find({}, function (err, psets) {
    for (var i = 0; i < psets.length; i++) {
      var monthsFromNow = moment().diff(moment(psets[i].last_checked_on),
        'months');

      if (monthsFromNow > 0)
        psets[i].remove();
    }
  });
}

removeUncheckedPsets();