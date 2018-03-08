const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var router 			 = express.Router();
var bodyParser 		 = require('body-parser');
var User 			 = require('../models/user');
var async            = require('async');
var session          = require('express-session');

var app = express();
var db_config 		 = require('../db-config.json');

//session
app.use(session({
    secret: 'sdong001',       //Cookie 변조 방지
    resave: false,            //세션을 언제나 저장할지 여부
    saveUninitialized: true   //저장되기전에 uninitialized 상태로 미리 저장
}));

router.use(bodyParser.urlencoded({ extended:true }));

router.get('/', function(req, res) {
    res.statusCode = 302;
    res.redirect('/');
    res.end();
});
            
router.post('/', function(req, res) {
    var sess = req.session;
    
    MongoClient.connect(db_config.host, function(err, client) {
        if(err){
            console.log(err);
            res.end();
            client.close();
        }
        else{
            const db = client.db(db_config.dbname);
            const collection = db.collection(db_config.user);
            
            /*** 전송된 form ***/
            var user = new User();
            user.email = req.body.inputEmail;
            user.password = req.body.inputPassword;
            
            var IsInserted = false;
            
            var registerTasks = [
                /*** 이메일 중복검사 ***/
                function verifyEmail(callback) {
                    
                        collection.find({ email: user.email }, { email: 1 }).toArray(function(err, result) {
                        
                        if(err) return callback(err);
                        callback(null, result);
                    });
                    
                },
                /*** DB에 삽입 ***/
                function insertDB(ver, callback) {
                    if(ver[0] !== undefined){
                        IsInserted = false;
                    }
                    else{
                        collection.insert({
                            email: user.email,
                            password: user.password
                        });
                        IsInserted = true;
                    }
                    client.close();
                    callback(null);
                }
            ];
            
            //task를 동기처리
            async.waterfall(registerTasks, function (err) {
                if (err){
                    throw err;
                }
                else{
                    /*** 가입 ***/
                    if(IsInserted){
                        sess.useremail = user.email;
                        
                        res.redirect('/main');
                        res.end();
                    }
                    /*** 거절 ***/
                    else{
                        res.render('signup', { useremail: sess.useremail, IsExist: true });    
                        res.end();
                        //res.redirect('/signup');
                    }
                }
            });
        }
    });
});

module.exports = router;
