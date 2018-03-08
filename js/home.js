$(function () {
    $("form").on("submit", function(e) {
        e.preventDefault();
        
        var idInputVal = $("input[name=inputEmail]").val();
        var pwInputVal = $("input[name=inputPassword]").val();
        
        var obj = [];
        obj.push({inputEmail: idInputVal, inputPassword:pwInputVal});
        
        $.ajax({
            url : '/api/login',
            type : 'POST',
            data : JSON.stringify(obj),
            datatype : 'json',
            processData : false,
            contentType: "application/json",
            success: function(data) {
                window.location.replace('/main');
                $('#loginWarning').addClass('invisible');
            },
            error: function(err) {
                $('#loginWarning').removeClass('invisible');
                $('#loginWarning').empty();
                if(err.status === 403){
                    $('#loginWarning').append("<strong>Sorry!</strong> Email or Password incorrect!");
                }
                else if(err.status === 406){
                    $('#loginWarning').append("<strong>Sorry!</strong> This account already logged in!");
                }
            }
        });
    });
});