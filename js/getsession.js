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
    var sess = req.session;
    
    userEmail = sess.useremail;
    
    res.send(userEmail);
    res.end();
});

module.exports = router;