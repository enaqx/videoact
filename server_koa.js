'use strict';
/**
 * Dependencies
 */
var fs = require('fs');
var koa = require('koa');
var favicon = require('koa-favicon');
var mongoose = require('mongoose');
var passport = require('koa-passport');

/**
 * Config
 */
var config = require('./config/config');

/**
 * Connect to database
 */
mongoose.connect(config.mongo.url);
mongoose.connection.on('error', function (err) {
  console.log(err);
});

/**
 * Load the models
 */
var models_path = config.app.root + '/src/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('js')) {
    require(models_path + '/' + file);
  }
});

/**
 * Server
 */
var app = module.exports  = koa();
app.use(favicon(__dirname + '/public/favicon.ico'));

require('./config/passport')(passport, config);

require('./config/koa')(app, config, passport);

// Routes
require('./config/routes')(app, passport);

// Start app
if (!module.parent) {
 app.listen(config.app.port);
 console.log('Server started, listening on port: ' + config.app.port);
}
console.log('Environment: ' + config.app.env);