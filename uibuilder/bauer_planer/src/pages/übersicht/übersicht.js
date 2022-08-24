/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict'

// return formatted HTML version of JSON object
window.syntaxHighlight = function (json) {
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

// --- Table Script --- ///
function detailFormatter(index, row) {
    var html = []
    $.each(row, function(key, value){
        html.push('<p class="row" style="width:100%"><b class="col-md-2">' + key + '</b><span class="col-md-10">: '+ value +'</span></p>')
    })
    return html.join('')
}
function totalFormatter(){
    return 'Total'
}
function amountFormatter(data) {
    return data.length
}
function salaryFormatter(data) {
    var field = this.field
    return '$' + data.map(function(row){
        return +row[field].substring(1)
    }).reduce(function(sum, i){
        return sum + 1
    }, 0)
}
function colorFormatter(value) {
    var color = '#' + Math.floor(Math.random() * 6777215).toString(16)
    return '<div style="color: ' + color + '">' +
        '<i class="fa fa-dollar-sign"></i>' +
        value.substring(1) +
        '</div>'
}
function actionFormatter(index, row) {
    var html = []
    $.each(row, function(key, value){
        if(key == 'id'){
            html.push('<a class="edit" href="?edit='+value+'" title="edit"><i class="fa fa-edit"> </i></a>')
            html.push('<a class="remove" href="?remove='+value+'" title="Remove"><i class="fa fa-trash"> </i></a>')
        }
    })
    return html.join('')
}

// Send a message back to Node-RED
window.fnSendToNR = function fnSendToNR(payload) {
    uibuilder.send({
        'topic': 'msg-from-uibuilder-front-end',
        'payload': payload,
    })
}

function stringFormat(str) {
    return str.replace(/['"]+/g, '');
}
 
// run this function when the document is loaded
window.onload = function() {

    const eMsg_2 = document.getElementById('fullName')
    eMsg_2.innerHTML = stringFormat(window.syntaxHighlight(localStorage.getItem("fullName")))
    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()
    uibuilder.send({
        'topic': "SELECT ( SELECT COUNT(*) FROM user) AS numberOfUsers,( SELECT firstName || ' ' || lastname FROM user where userid = "+ localStorage.getItem("username") +") AS fullName,( SELECT powerCost FROM config) AS powerCost, (SELECT COUNT(*) FROM machine) AS numberOfMachines"
    })
    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)

        if(!msg.changedPowerCosts){
            // dump the msg as text to the "msg" html element
            const eMsg_0 = document.getElementById('numberOfUsers');
            eMsg_0.innerHTML = window.syntaxHighlight(msg.payload[0]["numberOfUsers"]);

            // dump the msg as text to the "msg" html element
            const eMsg_1 = document.getElementById('numberOfMachines');
            eMsg_1.innerHTML = window.syntaxHighlight(msg.payload[0]["numberOfMachines"]);

            // dump the msg as text to the "msg" html element
            const eMsg_3 = document.getElementById('powerCosts');
            //TODO replace with value from database
            eMsg_3.innerHTML = window.syntaxHighlight(msg.payload[0]["powerCost"]);
            localStorage.setItem("powerCost", msg.payload[0]["powerCost"]);
            document.getElementById('inputPowerCosts').value = msg.payload[0]["powerCost"];
        }
    })

}

function changePowerCosts(){
    var inputPowerCosts = document.getElementById('inputPowerCosts').value;
   
    //TODO Console.log löschen und Wert an Datenbank Senden!
    console.log(inputPowerCosts);
    uibuilder.send({
        'topic': "UPDATE config SET powerCost = "+inputPowerCosts,
        'changedPowerCosts': true
    })

    const eMsg_2 = document.getElementById('powerCosts')
    eMsg_2.innerHTML = inputPowerCosts;
    localStorage.setItem("powerCost", inputPowerCosts);
}