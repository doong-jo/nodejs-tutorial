const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var loginrouter 	 = express.Router();
var logoutrouter 	 = express.Router();
var bodyParser 		 = require('body-parser');
var User 			 = require('../models/user');
var async            = require('async');
var session          = require('express-session');
var http            = require('http').Server(app);

var app = express();
var db_config 		 = require('../db-config.json');

var io = require('socket.io')(http);


//session
app.use(session({
    secret: 'sdong001',       //Cookie 변조 방지
    resave: false,            //세션을 언제나 저장할지 여부
    saveUninitialized: true   //저장되기전에 uninitialized 상태로 미리 저장
}));

var userList = [];
var logoutUser;


// Use jquery, ajax
// io.on('connection', function(socket){
//     socket.on('chat message', function(msg){
//         io.emit('chat message', msg);
//     });
// });


loginrouter.post('/', function(req, res) {
    var sess = req.session;
    
    for(var i=0; i<userList.length; i++){
        if( userList[i] === sess.useremail ){
            
            res.status(200).send({
                message: 'exist'
            });
        }
    }
    
    var obj = req.body;
    var email = obj[0]['inputEmail'];
    var password = obj[0]['inputPassword'];
    
    
    
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
            user.email = email;
            user.password = password;
            
            /*** 로그인 검사 ***/
            collection.find({ email: user.email, password: user.password }, { email: 1, password: 1}).toArray(function(err, result) {
                if(err) return callback(err);
                
                if(result[0] !== undefined){
                    //존재하는 로그인인지 검사
                    for(var j=0; j<userList.length; j++){
                        if( userList[j] === email){
                            res.status(406);
                            res.end();
                            client.close();
                            return;
                        }
                    }
                    
                    sess.useremail = user.email;
                    
                    userList.push(user.email);
                    
                    //es.redirect('/main');
                    res.status(200).send({
                       message: 'incorrect'
                    });
                    res.end();
                    client.close();
                }
                else{
                    //res.render('home', { IsLoginFail: true , useremail: null});
                    res.status(403);
                    res.end();
                    client.close();
                    return;
                }
            });
        }
    });
});

logoutrouter.get('/', function(req, res) {
    var sess = req.session;
    
    if(sess.useremail){
        logoutUser = sess.useremail;
        var i = userList.indexOf(sess.useremail);
        userList.splice(i,1);
        res.clearCookie('useremail');
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }else{
                console.log("session Destroy!!");
                io.sockets.emit('left', {userEmail:sess.useremail, userList:userList});
            }
        });
    }
    else{
        
    }
    
    res.redirect('/');
    res.end();
});

module.exports = {
    loginrouter : loginrouter,
    logoutrouter : logoutrouter,
    getlogoutUser : function getlogoutUser(){
        return logoutUser;
    },
    getUserList : function getUserList(){
        return userList;
    },
    findloggedUser : function findloggedUser(user){
        var i = -1;
        i = userList.indexOf(user);
        if( i !== -1 ){
            return true;
        }else{
            return false;
        }
    }
};

