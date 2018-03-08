const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var router 			 = express.Router();
var bodyParser 		 = require('body-parser');
var Msg 			 = require('../models/msg');
var async            = require('async');
var http             = require('http').Server(app);
var io               = require('socket.io')(http);

var app = express();
var db_config 		 = require('../db-config.json');
var userEmail;

router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.json());
router.use(express.urlencoded());

router.post('/', function(req, res) {
    console.log('chat getsess!!');
    var sess = req.session;
    
    userEmail = sess.useremail;
    console.log('userEmail is ');
    console.log(userEmail);
    
    var obj = [];
    obj.push({userEmail: userEmail});
    
    res.send(obj);
    res.end();
});

module.exports = {

    
    
    chatMessage : function chatMessage(msg){
        MongoClient.connect(db_config.host, function(err, client) {
            if(err){
                console.log(err);
                res.end();
                client.close();
            }
            else{
                const db = client.db(db_config.dbname);
                const collection = db.collection(db_config.msg);

                var model_Msg = new Msg();
                model_Msg.id = "";
                model_Msg.sendername = msg.userEmail;
                model_Msg.text = msg.text;
                model_Msg.recvname = msg.recvEmail;

                collection.insert({
                    id: model_Msg.id,
                    sendername: model_Msg.sendername,
                    text: model_Msg.text,
                    recvname: model_Msg.recvname
                });

                console.log('chat.js / insert msg completly');
                
                client.close();
            }
        });
    },
    
    router : router
    
    
    
};