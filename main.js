// base modules
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var session         = require('express-session');
var cookieParser    = require('cookie-parser');
var errorHandler    = require('errorhandler');
var http            = require('http').Server(app);
var path            = require('path');
var fs              = require('fs');

//additional modules
var morgan = require('morgan');
var ejs = require('ejs');
var io = require('socket.io')(http);

//mongodb
var db = require('./db');


//API
var registerUser     = require('./js/register');
var loginUser        = require('./js/login');
var logoutUser       = require('./js/logout');
var fileUpload       = require('./js/fileupload');
var fileSave         = require('./js/filesave');
var fileCompile      = require('./js/filecompile');
var chat             = require('./js/chat');
var chatRead         = require('./js/chatread');

var port = 80;

var connectUsers = [];
var userEmail;
var userList = [];

// all environments
app.set('port', port);

//favicon
app.use('/assets', express.static(__dirname + '/assets'));

//ejs
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

//morgan (logging)
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser());
app.use(session({
    secret : 'goorminternship',
    resave : false,
    saveUninitialized : true
}));

//bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride()); // simulate DELETE and PUT
app.use(express.static(path.join(__dirname, 'public')));

//jquery & bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

//user css, js
app.use('/stylesheet', express.static(__dirname + '/stylesheet'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/static', express.static(__dirname + '/public'));
app.use('/upload_project', express.static(__dirname + '/upload_project'));

//codemirror
app.use('/lib', express.static(__dirname + '/codemirror/lib'));
app.use('/mode', express.static(__dirname + '/codemirror/mode'));
app.use('/theme', express.static(__dirname + '/codemirror/theme'));

//xterm
app.use('/xterm', express.static(__dirname + '/node_modules/xterm/'));

app.set('env', 'development');

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

// 라우팅
app.get('/', function(req, res) {
    
    var sess = req.session;
    
    if( sess.useremail ){
        res.redirect('/main');
    }
    
    res.render('home', { IsLoginFail : false, useremail : sess.useremail });
});

app.get('/main', function(req, res) {
    var sess = req.session;
    
    //res.render('main', { moveURI: '', useremail : 'test' });
    
    
    
    if(sess.useremail){
        res.render('main', { moveURI: '', useremail : sess.useremail });
        
        setTimeout(function() {
            
            io.sockets.emit('enter', {userEmail:sess.useremail, userList:loginUser.getUserList()});
        }, 1500);
        
    }else{
        res.redirect('/');
    }
    
});

app.get('/signup', function(req, res) {
    var sess = req.session;
    
    res.render('signup', { IsExist : false, useremail : sess.useremail });
});

// APIs
app.use('/api/register', registerUser);
app.use('/api/login', loginUser.loginrouter);
app.use('/api/logout', loginUser.logoutrouter);
app.use('/api/fileupload', fileUpload);
app.use('/api/filesave', fileSave);
app.use('/api/filecompile', fileCompile);
app.use('/api/chatread', chatRead);
app.use('/api/getchatsess', chat.router);


/*

var connectUsers = [];
var userEmail;
*/

var count = 1;

//base socket
io.on('connection',function(socket){
    
    console.log('main.js / a user connected');
    
    
    console.log("main.js / connection id: ");
    console.log(socket.id);
 
    console.log("main.js / user" + count++);
    
    
    // 접속 종료
    socket.on('disconnect', function () {
        
        console.log("main.js / ------------connection leave-------------");
        console.log("main.js / "+userEmail);
        
        socket.broadcast.emit('left', {userEmail:loginUser.getlogoutUser(), userList:loginUser.getUserList()});
  });
    
    
    
    
    //send chat
    socket.on('chat message',function(msg){
        console.log('main.js / message: ' + msg);
        
        io.emit('chat message', msg);
        
        chat.chatMessage(msg);
    });
});

// nodejs 메소드 활용 서버 실행
http.listen(port, function(){
    console.log('main.js / listening on *:80');
});


// express 메소드 활용 서버 실행
// app.listen(port, function(){
//     console.log('Connected 80 port!');
// });

