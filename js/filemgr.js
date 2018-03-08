var editor;
var selectFilePath;
var saveKey = 19; // "Ctrl + s" => save shortcut
var compileKey = 18; //  "Ctrl + r " => compile shortcut
var userEmail;
var editorMode = 'python';


/*
 * Xterm.js
 */ 
// var term = new Terminal();
// term.open(document.getElementById('terminal'));
// term.write('Hello from \033[1;3;31mxterm.js\033[0m $ ');
// //term.applyAddon(fit);
// term.fit();

/*** file compile ***/
function fileCompile(_filePath, _fileText){
    if( _filePath === undefined || _fileText === '' ){
        console.log("fileSave Error or no change!");
        return;
    }
    
    var fileData = [];
    fileData.push({path: _filePath, text: _fileText});
    
    var lang;
    
    $.ajax({
        url:'/api/filecompile',
        type : 'POST',
        data : JSON.stringify(fileData),
        datatype : 'json',
        processData : false,
        contentType: "application/json",
        success: function(data) {
            
            $("#compileResult").empty();
            var htmlstring = data.replace(/(\r\n|\n|\r)/gm, "<br>");
            $("#compileResult").append("<strong>Output</strong><br>" + htmlstring);

            $("#compileResult").removeClass();
            $("#compileResult").addClass('alert alert-success');
            
            $('#runCodeBtn').removeClass('running');
        },
        error: function(err) {
            $("#compileResult").empty();
            $("#compileResult").empty();
            var htmlstring = err.responseText.replace(/(\r\n|\n|\r)/gm, "<br>");
            $("#compileResult").append("<strong>Output</strong><br>" + htmlstring);
            
            $("#compileResult").removeClass();
            $("#compileResult").addClass('alert alert-danger');
            
            $('#runCodeBtn').removeClass('running');
        }
    });
}

/*** file save ***/
function fileSave(_filePath, _fileText){
    if( _filePath === undefined || _fileText === '' ){
        console.log("fileSave Error or no change!");
        return;
    }
    
    //json으로 변활될 오브젝트
    var fileData = [];
    fileData.push({path: _filePath, text: _fileText});
    
    $.ajax({
        url:'/api/filesave',
        type : 'POST',
        data : JSON.stringify(fileData),
        datatype : 'json',
        processData : false,
        contentType: "application/json",
        success: function(data) {
            console.log("file save successfully!");
        },
        error: function(err) {
            console.log(err);
        }
    });
}


$(function () {
    //$('[data-toggle="tooltip"]').tooltip();
    $('#editorDiv').tooltip({
        trigger: 'manual',
        placement: 'top',
        delay: {
            show: "500",
            hdie: '100'
        }
    });
    $('#editorDiv').on('shown.bs.tooltip', function() {
        setTimeout(function() {
            $('#editorDiv').tooltip('hide');
        }, 1000);
    });
    
    $('#runCodeBtn').click(function() {
        $('#runCodeBtn').addClass('running');
        
        var strCode = editor.getDoc().getValue();
        fileCompile(selectFilePath, strCode);
    });
    // $('.example-popover').popover({
    //     container: 'body'
    // });
    /* keypress */
    /* key    charcode    
     * Ctrl     x            
     * s        115         
     * Ctrl s   19          
     * Ctrl r   18
     */
    
    $(document).keypress(function(e) {
        var x = e.charCode;
        
        var strCode = editor.getDoc().getValue();
        
        switch(e.charCode){
            case saveKey:
                $('#editorDiv').tooltip('show');
                fileSave(selectFilePath, strCode);
                break;
                
            case compileKey:
                $('#runCodeBtn').addClass('running');
                fileCompile(selectFilePath, strCode);
                break;
                
            default:
                break;
        }
    });

    /*** editor supervisor ***/
    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: true,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        mode: {name: editorMode, globalVars: true},
        theme: 'pastel-on-dark',
    });
    
    //editor.mode
    
    
    
    $.bind('keydown', 'ctrl+s', fileSave);
    
    /*** key shortcut(ctrl+s) detect ***/
    
    
    //jstree create
    var treeDiv = $("#treeLayer");
    function createTree(){
        treeDiv
        .bind("open_node.jstree close_node.jstree")
        //Add jstree node select event
        .on("select_node.jstree", function(evt, data){
            var file_type = data.node.original.type;
            var file_path = data.node.original.id;
            var file_name = data.node.text;
            
            var ind = file_name.split('.').length-1;
            var file_expend_type = file_name.split('.')[ind];
            
            switch(file_expend_type){
                case 'py' : editorMode = 'python'; break;
                case 'c' : editorMode = 'text/x-csrc'; break;
                case 'cpp' : editorMode = 'text/x-c++src'; break;
                default : break;
            }
            
            editor.setOption("mode", editorMode);
            
            if( file_type === 'f' ){
                 $.get(file_path, function(data){
                     selectFilePath = file_path;
                     var strCode = editor.getDoc().getValue();
                     editor.getDoc().setValue(data);
                 });
            }
        })
        .jstree({ 
            'core' : {
                'data' : {
                    "url" : "/upload_project/" + userEmail + "/project.json",
                    "dataType" : "json",
                },
                "animation" : 0,
                "check_callback" : true,
                "themes" : { "stripes" : true },

            },
            "types" : 
            {
                "root" : {
                    "icon" : "static/images/tree_icon.png"
                },
                "f" : {
                  "icon" : "/static/images/file_icon.png",
                  "valid_children" : []
                }
            },
            "plugins" : [ 
                "sort",
                "search",
                "state",
                "types",
                "unique"
            ]
        });
        
        /*** Search Plugin 추가 ***/
        var to = false;
        $('#searchFile').keyup(function () {
            if(to) { clearTimeout(to); }
            to = setTimeout(function () {
                var v = $('#searchFile').val();
                treeDiv.jstree(true).search(v);
            }, 250);
        });
    }
    
    
    var fileUploadBtn = $('#fileUploadInput');
    var formData = new FormData();
    
    $.ajax({
        url : '/api/fileupload/usersess',
        type : 'POST',
        data : '',
        datatype : 'html',
        processData : false,
        contentType : false,
        success: function(data) {
            userEmail = data;
            $.ajax({
                url:"/upload_project/" + userEmail + "/project.json",
                type:'GET',
                error: function()
                {
                    //json not exists
                    treeDiv.hide();
                },
                success: function()
                {
                    //json exists
                    createTree();
                    treeDiv.show();
                }
            });
        },
        error: function(err){
            console.log(err);

        }
    });
    
    /*** json 파일 존재 유무 검사 ***/
    
    
    
    
    /*** 파일 선택 클릭 시 value를 초기화 함으로써 change event 발생을 유도 ***/
    fileUploadBtn.click(function() {
        fileUploadBtn[0].value = '';
    });
    
    /*** change event only file select & open (not cancel) ***/
    /*** value가 '' 일때 '선택된 파일 없음'으로 초기화 되므로 cancel 시에는 not change ***/
    fileUploadBtn.change(function(ev) {
        
        formData.append("uploadfile", fileUploadBtn[0].files[0]);
        
        $.ajax({
            url : '/api/fileupload',
            type : 'POST',
            data : formData,
            datatype : 'html',
            processData : false,
            contentType : false,
            success: function(data) {
                
                if(data === 'JSONcompleted') {
                    createTree();
                    treeDiv.jstree("refresh");
                    if ( treeDiv.css('display') == 'none' ) {
                        treeDiv.show();
                    }
                    formData.delete("uploadfile", fileUploadBtn[0].files[0]);
                }
                
            },
            error: function(err){
                console.log(err);
            
            }
        });
    });
});
