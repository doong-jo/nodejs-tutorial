const MongoClient    = require('mongodb').MongoClient;
var express          = require('express');
var router 			 = express.Router();
var bodyParser 		 = require('body-parser');
var fs               = require('fs');
var formidable       = require('formidable');
var decompress       = require('decompress');
var session          = require('express-session');

var app = express();

router.use(bodyParser.urlencoded({ extended: true }));

router.use(express.json());
router.use(express.urlencoded());

var allProjectDir = './upload_project/';
var rootProjectDir = "./upload_project";
var jsonFile = "project.json";

var idNum = 0;
var obj = [];
var idText = "fileId";

/*
 * '__MACOSX'를 제거하기 위한 재귀적 폴더/파일 제거 삭제
 */
function rmFilesInDir(dirPath) {
    var files;
    try { files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0){
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile()){
                fs.unlinkSync(filePath);
            }
            else{
                rmFilesInDir(filePath);
            }
        }
    }
  fs.rmdirSync(dirPath);
}

/*
 * Dir을 재귀적으로 조사해 object에 push
 */
function recurSearchDir(dirPath) {
    //console.log("dirPath : " + dirPath);
    var parentID = dirPath;
    
    var files;
    try { files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    //console.log("dirPath + files.length : "+  dirPath + files.length);
    if (files.length > 0){
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            //console.log("filepath : " + filePath);
            //Is File?
            if (fs.statSync(filePath).isFile()){
                //console.log("file files[i] : " + files[i]);
                obj.push({type: "f", id: filePath, parent: parentID, text: files[i]});
            }
            //Is Directory?
            else{
                //console.log("dir files[i] : " + files[i]);
                obj.push({type: "d", id: filePath, parent: parentID, text: files[i]});
                recurSearchDir(filePath);
            }
            idNum++;
        }
    }
}

/*
 * 조사한 결과를 json파일로 생성
 */
function makeDirJSON(_userDir, _jsonDir) {
    
    
    //rootProjectDir : "./upload_project";
    recurSearchDir(_userDir);
    
    var json = JSON.stringify(obj);
    fs.writeFileSync(_jsonDir, json, 'utf8', function (err) {
        if(err) throw err;
    });
}

/*
 * 사용자의 업로드 디렉터리 생성
 */
function makeDirOfUser(_sess){
    var userUploadDir = allProjectDir + _sess.useremail + "/";
    
    if( fs.existsSync(userUploadDir)){
        return;
    }else{
        fs.mkdirSync(userUploadDir);
    }
}

/****************************** routing ******************************/
router.get('/', function(req, res) {
    var sess = req.session;
    
    if( !sess.useremail ){
        res.statusCode = 302;
        res.redirect('/');
        res.end();
    }
});

router.post('/usersess', function(req, res) {
    var sess = req.session;
    
    console.log('session email : ');
    console.log(sess.useremail);
    
    res.send(sess.useremail);
    res.end();
});

router.post('/', function(req, res) {
    var sess = req.session;
    
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    //temporary upload file dir
    form.uploadDir = __dirname + '/temp_uploads'; 
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) { });
            
    form.on('end', function(fields, files) {
        
        var temp_path = this.openedFiles[0].path;
        var file_name = this.openedFiles[0].name;
        var file_type = this.openedFiles[0].type;
        var new_location = '/uploads';
        
        
        if( file_type !== 'application/zip' && file_type !== 'application/x-tar' )
        {
            res.status(403);
            res.end();
            return;
        }
        // ./projectName 에서 projectName만 추출
        var strArray = file_name.split('.');
        var projectName_min = strArray[0];
        var archive_dir = allProjectDir + sess.useremail + "/" + projectName_min;
        var user_dir = allProjectDir + sess.useremail;
        var dirFiles;
        try { dirFiles = fs.readdirSync(allProjectDir); }
        catch(e) { return; }
        
        
        
        //중복된 프로젝트를 업로드 시 거부
        for(var j=0; j<dirFiles.length; j++){
            if( dirFiles[j] === projectName_min ){
                fs.unlinkSync(temp_path);
                res.status(403);
                res.end();
                return;
                //Modal
            }
        }
        //아닐 시 프로젝트 디렉터리 생성.
        makeDirOfUser(sess);
        
        // if (!fs.existsSync(archive_dir)){
        //     fs.mkdirSync(archive_dir);
            
        //     //console.log("mkdirSync : " + archive_dir);
        // }
        
        obj.push({type: "root", id: rootProjectDir, parent: "#", text: "Root Project"});
        obj.push({type: "d", id: user_dir, parent: rootProjectDir, text: sess.useremail});
        
        decompress(temp_path, archive_dir + "/").then(files => {
            //console.log("decompress!"); 
            //console.log("temp_path : " + temp_path);
            fs.unlinkSync(temp_path);
            
            // '__MACOSX' 삭제
            if( fs.existsSync(archive_dir + "/__MACOSX/")){
                rmFilesInDir(archive_dir + "/__MACOSX/");
            }
            var jsonDir = allProjectDir + sess.useremail + "/" + jsonFile;
            if( fs.existsSync(jsonDir)){
                fs.unlinkSync(jsonDir);
                console.log("jsonDir : " + jsonDir);
                console.log("Exist json and remove!");
            }
            
            makeDirJSON(allProjectDir + sess.useremail, jsonDir);
            
            obj = [];
            
            res.end('JSONcompleted');
            //res.status(200).end();
        });
    });
    // if( IsDone === true ){
    //     res.status(200);
    //     res.end();
    // }
    
});

module.exports = router;