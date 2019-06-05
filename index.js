#!/usr/bin/env node

const mosca = require('mosca');
const Promise = require('promise');
const bcrypt = require('bcryptjs');
const MongoClient = require('mongodb').MongoClient;

// windston logger 
// debug file present on /debug
const logger = require('./logger.js');
const settings = require('./settings');

const server = new mosca.Server(settings.mosca);

const mysql = settings.mysql;

// when a client is connected
server.on('clientConnected', function(client) {
  logger.info('Client connected: '+ client.id);
});

// when a client is disconnected
server.on('clientDisconnected', function(client) {
  logger.info('Client disconnected: '+ client.id);
});

var published = function(packet, client) {
  logger.info('Client published: '+ packet.payload);

  MongoClient.connect(settings.mongo.url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db(settings.mongo.db);

    // Here we can change the packet 
    packet.timestamp = Date.now() / 1000 | 0;

    dbo.collection(settings.mongo.col).insertOne(packet, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
};

var authenticate = function(client, username, password, callback) {
  var promise = new Promise(function(resolve,reject){
    mysql.query('SELECT password FROM users WHERE email = ?',[username], function (error, results, fields) {
      if(error){
        logger.error("MySQL error: "+error);
        reject();return;
      }
      if(results.length>0){
        // async method to check the password
        (async () =>{
          bcrypt.compare(password.toString(), results[0].password.toString(), function(err, res) {
            if (err) throw err;
            if(res) {
              logger.info("User "+username+" logged in...");
              resolve();
            } else {
              // Wrong Password
              logger.warn("Wrong password...");
              reject();
            }
          });
        })(); 

      } else{
        // User doesn't exist
        logger.warn("User doesn't exist...");
        reject();
      }
    });
  });
  promise.then(function(){
    // Authenticate
    callback(null,true);
  }).catch(function(){
    // Reject
    callback(null,false);
  });
};

server.on('ready', function(){
  // Override the authenticate function
  server.authenticate = authenticate;
  // Override the published function
  server.published = published;

  logger.info('Mosca server is up and running on port: '+settings.mosca.port+'...');
});