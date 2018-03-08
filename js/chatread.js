const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var router 			 = express.Router();
var bodyParser 		 = require('body-parser');
var session          = require('express-session');
var fs               = require('fs');
var db_config 		 = require('../db-config.json');

var app = express();

app.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.json());
router.use(express.urlencoded());

router.post('/', function(req, res) {
    var obj = req.body;
    var recvVal = obj[0]['recvname'];
    var sendVal = obj[0]['sendername'];
    
    
    
    MongoClient.connect(db_config.host, function(err, client) {
        if(err){
            console.log(err);
            res.end();
            client.close();
        }
        else{
            const db = client.db(db_config.dbname);
            const collection = db.collection(db_config.msg);
            
            /*
            type: String,
            sendername: String,
            text: String,
            recvname: String
            */
            /*
            $or: [ { "title": "article01" }, { "writer": "Alpha" } ]
            */
            
            if(recvVal === "All"){
                collection.find({ recvname: recvVal },
                                { sendername: 1, text: 1, recvname: 1 })
                    .sort({_id: 1})//_id: 1 => insert한 순으로 <=>? _id: -1
                    .toArray(function(err, result)
                    {
                        if(err){
                            console.log(err);
                            throw err;
                        }
                        else{
                            res.status(200);
                            res.send(result);
                            res.end();
                            client.close();
                        }
                });
            }
            else{
                collection.find({
                    $or: [
                        { $and: [ { sendername: sendVal }, { recvname: recvVal } ] },
                        { $and: [ { sendername: recvVal }, { recvname: sendVal } ] } 
                    ]},
                                { sendername: 1, text: 1, recvname: 1 })
                    .sort({_id: 1})//_id: 1 => insert한 순으로 <=>? _id: -1
                    .toArray(function(err, result)
                    {
                        if(err){
                            console.log(err);
                            throw err;
                        }
                        else{
                            res.status(200);
                            res.send(result);
                            res.end();
                            client.close();
                        }
                });
            }
        }
    });
});

module.exports = router;