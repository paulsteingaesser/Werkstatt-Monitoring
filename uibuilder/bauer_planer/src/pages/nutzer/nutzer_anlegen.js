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

function inputEmptyCheck(inputtxt) {
    if (inputtxt == null || inputtxt == "") {
        return false;}
    else{
        return true;
    }
}
function inputLetterCheck(inputtxt) {
    if((!/[^a-zA-Z]/.test(inputtxt))){
        return true;
    }
    else{
        return false;
    }
}

function addNewUser(){
    var firstName = document.getElementById('inputVorname').value;
    var lastname = document.getElementById('inputNachname').value;
    var password = document.getElementById('inputPasswort').value;
    var company = document.getElementById('inputFirma').value;
    var admin = document.getElementById('inputAdmin').checked;
    var permission = document.getElementById('berechtigungsstufe').value;


    if (!inputEmptyCheck(firstName) || !inputEmptyCheck(lastname)) {
        alert("Bitte füllen Sie alle Pflichtfelder aus");
    }else if(!inputLetterCheck(firstName) || !inputLetterCheck(lastname)){
        alert("Dürfen keine Sonderzeichnen oder Nummern bei Namen eingegeben werden!"); 
    }else{
        uibuilder.send({
            'topic': 'INSERT INTO user(password, lastname, firstName, admin, permission, company) VALUES("'+password+'", "'+lastname+'", "'+firstName+'", '+admin+', '+permission+', "'+company+'")'
        })
        alert("Neuer Nutzer ist erforderlich hinzugefügt."); 
        window.location.href="nutzer.html";
    }

    

}

// run this function when the document is loaded
window.onload = function() {
    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()

    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)

    })
}

document.body.addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.stopImmediatePropagation();
        
        document.getElementById("addUserButton").click();
    }
});