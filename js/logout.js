const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var session          = require('express-session');
var router 			 = express.Router();

var app = express();
var db_config 		 = require('../db-config.json');

//session
app.use(session({
    secret: 'sdong001',       //Cookie 변조 방지
    resave: false,            //세션을 언제나 저장할지 여부
    saveUninitialized: true   //저장되기전에 uninitialized 상태로 미리 저장
}));

router.get('/', function(req, res) {
    var sess = req.session;
    
    if(sess.useremail){
        res.clearCookie('useremail');
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }else{
                console.log("session Destroy!!");
                
            }
        });
    }
    else{
        
    }
    res.redirect('/');
    res.end();
});

module.exports = router;
