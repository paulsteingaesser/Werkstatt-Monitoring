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
    console.log(localStorage.getItem("fullName"));
    console.log(localStorage.getItem("admin"));
    console.log(localStorage.getItem("userID"));

    const eMsg_2 = document.getElementById('fullName')
    eMsg_2.innerHTML = stringFormat(window.syntaxHighlight(localStorage.getItem("fullName")))
    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()

    var querryForDataTable = "SELECT * FROM data WHERE userid=" + localStorage.getItem("userID") + " ORDER BY start DESC limit 500";
    var querryForUserTable = "SELECT permission, company FROM user WHERE userid=" + localStorage.getItem("userID");
    
    uibuilder.send({
        'topic': querryForDataTable,
        'usecase': "dataTable"
    });

    uibuilder.send({
        'topic': querryForUserTable,
        'usecase': "userTable"
    })
    
    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg);

        if(msg.usecase == "dataTable") {
            $('#dataTable').bootstrapTable({
                columns: [{
                    field: 'userid',
                    title: 'UserID',
                    sortable: "true"
                },{
                    field: 'machineName',
                    title: 'Maschinenname',
                    sortable: "true"
                }, {
                    field: 'start',
                    title: 'Start',
                    sortable: "true",
                    formatter: "convertMillisToDate"
                }, {
                    field: 'end',
                    title: 'Ende',
                    sortable: "true",
                    formatter: "convertMillisToDate"
                }, {
                    field: 'duration',
                    title: 'Dauer',
                    sortable: "true",
                    formatter: "convertMillisToHoursMinutesSeconds"
                }, {
                    field: 'power',
                    title: 'Strom in Watt',
                    sortable: "true",
                    formatter: "wattFormatter"
                }, {
                    field: 'kWh',
                    title: 'kWh',
                    sortable: "true",
                    formatter: "calculateKWH"
                }],
                data: msg.payload
            })
        }
        
        if(msg.usecase == "userTable") {
            $('#userTable').bootstrapTable({
                columns: [{
                    field: 'company',
                    title: 'Firma',
                },{
                    field: 'permission',
                    title: 'Berechtigungsstufe',
                }],
                data: msg.payload
              })
        }
    })

}

function changePowerCosts(){
    var inputPowerCosts = document.getElementById('inputPowerCosts').value;
   
    //TODO Console.log löschen und Wert an Datenbank Senden!
    console.log(inputPowerCosts);

    const eMsg_2 = document.getElementById('powerCosts')
    eMsg_2.innerHTML = inputPowerCosts;
}

/*
function checkAdmin(adminPath, normalPath){
    if(localStorage.getItem("admin") === 1){
        window.location.href="../übersicht/übersicht.html";
    } else {
        window.location.href="../übersicht/übersichtNormalerNutzer.html";
    }
}
*/