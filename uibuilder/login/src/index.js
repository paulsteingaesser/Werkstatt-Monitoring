/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict'
document.getElementById('textbox_id').value
// return formatted HTML version of JSON object


// Send a message back to Node-RED
window.fnSendToNR = function fnSendToNR(payload) {
    uibuilder.send({
        'topic': 'msg-from-uibuilder-front-end',
        'payload': payload,
    })
}


window.login = function login() {
    var username=document.getElementById(username).value;
    var password=document.getElementById(password).value;
    uibuilder.send({
        'topic': '1',
        'payload': username,
    })
        uibuilder.send({
        'topic': '2',
        'payload': password,
    })
}

// run this function when the document is loaded
window.onload = function() {
    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()

    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)

        // dump the msg as text to the "msg" html element
        const eMsg = document.getElementById('msg')
        eMsg.innerHTML = window.syntaxHighlight(msg)
    })
}
