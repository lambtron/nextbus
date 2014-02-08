'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Message Schema
 */
var PsetSchema = new Schema({
  created_on: {
    type: Date,
    default: Date.now
  },
  phone_number: {
    type: String,
    default: '',
    trim: true
  },
  url_endpoint: {
    type: String,
    default: '',
    trim: true
  },
  stops: {
    type: Array,
    default: []
  }
});

// var stops = [{route: '2', stopTag: '6608'},
//              {route: '3', stopTag: '6592'},
//              {route: '38', stopTag: '4761'},
//              {route: '38L', stopTag: '4294'}];

/**
 * Statics
 */
PsetSchema.statics = {

};

mongoose.model('Pset', PsetSchema);