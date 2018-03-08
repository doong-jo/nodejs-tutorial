var enterKey = 13;
var userEmail;
var connectionList = [];
var IsExist = false;
var chatBtnArr = [];
const allRoomName = 'All';
var chatRoomName = allRoomName;
var firstEnter= false;
var beforeEmail = '';

//chatroom resize
$(window).resize(function() {
    $('#chatroom').css('height', window.innerHeight - 300);
});

function readChats(recvName, sendName){
    var obj = [];
    obj.push({recvname: recvName, sendername: sendName});
    
    $.ajax({
        url : '/api/getchatsess',
        type : 'POST',
        data : JSON.stringify(obj),
        datatype : 'json',
        processData : false,
        contentType: "application/json",
        success: function(data) {
            userEmail = data[0].userEmail;
            
            //DB의 chat들을 읽어들임.
            $.ajax({
                url : '/api/chatread',
                type : 'POST',
                data : JSON.stringify(obj),
                datatype : 'json',
                processData : false,
                contentType: "application/json",
                success: function(data) {

                    for(var i=0; i<data.length; i++){
                        var sndName = data[i].sendername;
                        if ( sndName === userEmail ){
                            $('#messages').append("<li class='chat-li-me'><span class='chat-me-username'>"+data[i].sendername+"</span><span class='chat-message-me'>"+data[i].text+"</span></li>");
                            $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
                        }
                        else{
                            $('#messages').append("<li class='chat-li-other'><span class='chat-other-username'>"+data[i].sendername+"</span><span class='chat-message-other'>"+data[i].text+"</span></li>");
                            $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
                        }
                    }
                },
                error: function(err) {
                    console.log(err);
                    throw err;
                }
            });
        },
        error: function(err) {
            console.log(err);
            throw err;
        }
    });
}

function makeConnectionList(userList){
    var chatroomlist = $('#chatroomlist');
    chatroomlist.empty();
    //기본 all 생성
    chatroomlist.append("<div class='row chatroomlistblock'><div class='col-6'><span class='align-middle'>All</span></div><div class='ml-auto col-6 text-right'><button type='button' class='chatBtn ml-auto btn btn-info btn-sm' data='All'>Chat</button></div></div>");
    
    for(var i = 0; i in userList; i++){
        var user = userList[i].split('@');
        var strdisabled = '';
        
        if(userList[i] === userEmail ){
            strdisabled = 'disabled';
        }
        else{
            strdisabled = '';
        }
        
        //사용자 생성
        $('#chatroomlist').append("<div class='row chatroomlistblock'><div class='col-6'><span class='align-middle'>"+userList[i]+"</span></div><div class='ml-auto col-6 text-right'><button type='button' class='chatBtn ml-auto btn btn-info btn-sm "+strdisabled+"' data='"+ userList[i] +"'>Chat</button></div></div>");
    }
    
    //chatBtn click event
    $(".chatBtn").click(function () {
        
        chatRoomName = $(this).attr('data');
        var roomTitle = $('#roomTitle');
        
        roomTitle.empty();
        roomTitle.append("<strong>" + chatRoomName + '</strong>');
        
        $('#messages').empty();
        readChats(chatRoomName, userEmail);
    });
}

socket.on('enter', function(data){// 입장 알림
    //Connection list
    
    $('#messages').append("<li class='chat-li-notice'>"+data.userEmail+"님이 들어오셨습니다."+"</li>");
    $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    
    makeConnectionList(data.userList);
    
});


socket.on('left', function(data){// 퇴장 알림
    if( data.userEmail === undefined || data.userEmail === beforeEmail){
        return;
    }
    
    $('#messages').append("<li class='chat-li-notice'>"+data.userEmail+"님이 나가셨습니다."+"</li>");
    $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
    
    makeConnectionList(data.userList);
    
    beforeEmail = data.userEmail;
});

$(function () {
    //chatroom resize
    $('#chatroom').css('height', $(window).innerHeight() - 300);
    
    
    $("#v-pills-chat-tab").click(function(){
        //opacity가 완료되고 나서 div값들이 초기화되므로 0.2초 후에 동작
        setTimeout(function() {
            $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
        }, 200);
    });
    
    
    //$("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);
    
    var socket = io();
    
    
    
    readChats(allRoomName, "");
    
    
    
    
    
    //web side - append html
    $('#sendBtn').click(function(){
        socket.emit('chat message', {text:$('#m').val(), userEmail:userEmail, recvEmail:chatRoomName});
        $('#m').val('');
    });
    
    $(document).keypress(function(e) {
        var x = e.charCode;
        
        if (e.charCode === enterKey && $('#m').is(':focus') ){
            socket.emit('chat message', {text:$('#m').val(), userEmail:userEmail, recvEmail:chatRoomName});
            $('#m').val('');
        }
    });
    
    
    socket.on('chat message', function(msg){
        
        if( userEmail === msg.userEmail){
            $('#messages').append("<li class='chat-li-me'><span class='chat-me-username'>"+msg.userEmail+"</span><span class='chat-message-me'>"+msg.text+"</span></li>");
            $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
        }
        else if( chatRoomName === allRoomName || 
                (userEmail === msg.recvEmail && chatRoomName === msg.userEmail)){
            $('#messages').append("<li class='chat-li-other'><span class='chat-other-username'>"+msg.userEmail+"</span><span class='chat-message-other'>"+msg.text+"</span></li>");
            $('#chatroom').scrollTop($('#chatroom').prop('scrollHeight'));
        }
        
    });
    
});
