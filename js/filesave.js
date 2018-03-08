const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var router 			 = express.Router();
var bodyParser 		 = require('body-parser');
var session          = require('express-session');
var fs               = require('fs');

var app = express();

app.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.json());
router.use(express.urlencoded());

router.post('/', function(req, res) {
    var obj = req.body;
    var path = obj[0]['path'];
    var text = obj[0]['text'];
    
    fs.writeFile(path, text, function(err){
        if (err) throw err;
        console.log(path);
        console.log(text);
        console.log('The file has been saved!');
        res.end();
    });
});

module.exports = router;