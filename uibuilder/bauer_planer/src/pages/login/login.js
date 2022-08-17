/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict'

window.login = function (string){
    cls= "string"
     return '<span class="' + cls + '">' + string + '</span>'
}

// return formatted HTML version of JSON object

window.syntaxHighlight = function syntaxHighlight (json) {
    json = JSON.stringify(json, undefined, 4)
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number'
        if ((/^"/).test(match)) {
            if ((/:$/).test(match)) {
                cls = 'key'
            } else {
                cls = 'string'
            }
        } else if ((/true|false/).test(match)) {
            cls = 'boolean'
        } else if ((/null/).test(match)) {
            cls = 'null'
        }
        return '<span class="' + cls + '">' + match + '</span>'
    })
    return json
} // --- End of syntaxHighlight --- //
window.loginMsg = function loginMsg (json) {
    json = JSON.stringify(json, undefined, 4)
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number'
        if ((/^"/).test(match)) {
            if ((/:$/).test(match)) {
                cls = 'key'
            } else {
                cls = 'string'
            }
        } else if ((/true|false/).test(match)) {
            cls = 'boolean'
        } else if ((/null/).test(match)) {
            cls = 'null'
        }
        return '<span class="' + cls + '">' + match + '</span>'
    })
    return json
} // --- End of syntaxHighlight --- //

// Send a message back to Node-RED
window.fnSendToNR = function fnSendToNR(payload) {
    uibuilder.send({
        'topic': 'msg-from-uibuilder-front-end',
        'payload': payload,
    })
}

var username;
var password;
window.login = function login() {
    username=document.getElementById('username').value;
    password=document.getElementById('password').value;

    uibuilder.send({
        'topic': "SELECT true FROM user WHERE userID ="+username,
        'name': "checkUser"
    })
}

function navigator(boo) {
   if (boo){
        window.location.href="../übersicht/übersicht.html";
        console.log("Login succeeded as Admin");
    }else{
        //window.location.href="../übersicht/übersicht.html";
        console.log("Login succeeded as user");
    }
}

// run this function when the document is loaded
window.onload = function() {
    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start();

    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg.payload)
   
   
        if (msg.name == "checkUser"){
                if(msg.payload == ""){
                    console.log("User doesn't exist");
                }else if (msg.payload[0]["true"] == 1){
                    uibuilder.send({
                        'topic': "SELECT password, admin FROM user WHERE userID =" +username,
                        'name' : "checkPass"
                    })
                    console.log("User exist")
                }

        }else if (msg.name == "checkPass"){
                    if ( msg.payload[0]["password"] ==  password ){
                        navigator(msg.payload[0]["admin"])
                        localStorage.setItem("username",username);
                    } else {
                        console.log("Password is incorrect")
                    }
                }
    
        // dump the msg as text to the "msg" html element
        //const eMsg = document.getElementById('msg')
        //eMsg.innerHTML = loginMsg(msg)
        })
}

document.body.addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.stopImmediatePropagation();
        
        document.getElementById("loginButton").click();
    }
});