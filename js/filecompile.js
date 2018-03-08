const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var router 			 = express.Router();
var bodyParser 		 = require('body-parser');
var session          = require('express-session');
var fs               = require('fs');
var compile_run      = require('compile-run');
var compileX         = require('compilex');


//compileX options
var options = {stats : true};
compileX.init(options);

var app = express();

app.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.json());
router.use(express.urlencoded());

router.post('/', function(req, res) {
    var obj = req.body;
    var path = obj[0]['path'];
    var text = obj[0]['text'];
    var type = path.split('.')[path.split('.').length-1];
    
    console.log("server path : " + path);
    console.log("server type : " + type);
    console.log("server text : " + text);
    
    var pythonShellOps  = {
        encoding : 'utf8'
    };
    
    // Python Compile
    switch(type){
        case 'py':
            var envData = { OS : "linux" }; 
            compileX.compilePython( envData , text , function(data){
                if(data.error){
                    res.status(403);
                    res.send(data.error);
                    res.end();
                }
                else{
                    var str = '';
                    str = data.output;
                    str.replace(/\n/gi, "<br>");
                    console.log("str");
                    console.log(str);
                    console.log(data);
                    console.log(data.output);
                    res.status(200);
                    res.send(data.output);
                    res.end();
                }
            });    
            break;
            
        case 'c':
            console.log("compile c!!");
            var envData = { OS : "linux" , cmd : "gcc" }; // ( uses gcc command to compile ) 
            compileX.compileCPP(envData , text , function (data) {
                if(data.error){
                    console.log('compile error!');
                    console.log(data.error);
                    res.status(403);
                    res.send(data.error);
                    res.end();
                }
                else{
                    console.log('compile success!');
                    res.status(200);
                    res.send(data.output);
                    res.end();
                }
            });
            break;
            
        case 'cpp':
            console.log("compile cpp!!");
            var envData = { OS : "linux" , cmd : "gpp" }; // ( uses gcc command to compile ) 
            compileX.compileCPP(envData , text , function (data) {
                console.log(data);
                if(data.error){
                    res.status(403);
                    res.send(data.error);
                    res.end();
                }
                else{
                    res.status(200);
                    res.send(data.output);
                    res.end();
                }
            });
            break;
            
        default:
            break;
    }
});

module.exports = router;