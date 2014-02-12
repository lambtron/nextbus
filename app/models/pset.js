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
  last_checked_on: {
    type: Date,
    default: Date.now
  },
  phone_number: {
    type: String,
    default: '',
    trim: true
  },
  pset_id: {
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
PsetSchema.methods = {
  updateLastChecked: function updateLastChecked () {
    this.last_checked_on = Date.now;
  }
};

mongoose.model('Pset', PsetSchema);