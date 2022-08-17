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
    console.log(inputtxt.length);
    if (inputtxt == null || inputtxt == "" || inputtxt.length <= 2) {
        return true;}
    else{
        return false;
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


function snackbarMessage(str){
    var x = document.getElementById("snackbar");
    x.innerHTML= str;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}


function addNewMachine(){
    var machineName = document.getElementById('inputMaschinenname').value;
    var permission = document.getElementById('berechtigungsstufe').value;
    var setUpTime = document.getElementById('inputRüstzeiten').value;
    var cost = document.getElementById('inputKosten').value;
    var materialConsumption = document.getElementById('inputMaterialverbrauch').value;
    var area = document.getElementById('inputBereich').value;
    var factor = document.getElementById('inputFaktor').value;

    if(inputEmptyCheck(machineName)){
        snackbarMessage("Maschinenname darf nicht leer oder zu kürz sein!")
    }
    else if(inputLetterCheck(setUpTime) || inputLetterCheck(cost) || inputLetterCheck(materialConsumption) || inputLetterCheck(factor)){
        snackbarMessage("Falsche Werte eingegeben!")
    }else{ 
        uibuilder.send({
        'topic': 'INSERT INTO machine VALUES("'+machineName+'", "'+permission+'", "'+setUpTime+'", "'+cost+'", "'+materialConsumption+'", "'+area+'", "'+factor+'")'
        })
        snackbarMessage("Neue Maschine ist hinzufügt");
        setTimeout(function() { window.location.href="maschinen.html"; }, 1000);

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
        
        document.getElementById("addMachineButton").click();
    }
});