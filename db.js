const MongoClient    = require('mongodb').MongoClient;
const assert         = require('assert');
var db_config 		 = require('./db-config.json');
 
// Connection URL
const url = 'mongodb://127.0.0.1:27017';
 
 
// Use connect method to connect to the server
MongoClient.connect(db_config.host, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server " + db_config.host);
    
    client.close();
});