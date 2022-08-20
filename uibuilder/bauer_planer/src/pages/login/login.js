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

var userID;
var password;

window.login = function login() {
    userID=document.getElementById('userID').value;
    password=document.getElementById('password').value;

    uibuilder.send({
        'topic': "SELECT true FROM user WHERE userID ="+userID,
        'name': "checkUser"
    })
}

function navigator(admin) {
   if (admin){
        window.location.href="../übersicht/übersicht.html";
        console.log("Login succeeded as Admin");
    }else{
        window.location.href="../übersicht/übersichtNormalerNutzer.html";
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
                        'topic': "SELECT password, admin, firstName, lastname  FROM user WHERE userID =" +userID,
                        'name' : "checkPass"
                    })
                    console.log("User exist")
                }

        }else if (msg.name == "checkPass"){
                    if ( msg.payload[0]["password"] ==  password ){
                        navigator(msg.payload[0]["admin"]);
                        var fullName = msg.payload[0]["firstName"] + " " + msg.payload[0]["lastname"];
                        localStorage.setItem("fullName", fullName);
                        localStorage.setItem("admin", msg.payload[0]["admin"]);
                        localStorage.setItem("userID", userID);
                    } else {
                        console.log("Password is incorrect")
                    }
                }
        })
}

document.body.addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.stopImmediatePropagation();
        
        document.getElementById("loginButton").click();
    }
});