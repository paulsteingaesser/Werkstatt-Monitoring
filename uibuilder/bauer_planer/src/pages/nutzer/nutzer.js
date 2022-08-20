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

function adminFormat(value, row, index) {
    if (value==1){return "Admin";
}else {
    return "";
}}
 
// run this function when the document is loaded
window.onload = function() {
    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()
    uibuilder.send({
        'topic': "SELECT *  FROM user"
    })

    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)

        $('#table').bootstrapTable({
            columns: [{
              field: 'userid',
              title: 'User-ID',
              sortable: "true"
            },{
                field: 'lastname',
                title: 'Nachname',
                sortable: "true"

            }, {
                field: 'firstName',
                title: 'Vorname',
                sortable: "true"

            }, {
                field: 'admin',
                title: 'Admin',
                sortable: "true",
                formatter: "adminFormat"

            }, {
                field: 'permission',
                title: 'Berechtigungsstufe',
                sortable: "true"

            }, {
                field: 'company',
                title: 'Firma',
                sortable: "true"

            }, {
                field: 'operate',
                title: 'Bearbeiten',
                align: 'left',
                valign: 'middle',
                clickToSelect: false,
                formatter : function(value,row,index) {
                    var editButton = '<a href="nutzer_bearbeiten.html?userid='+row.userid+'" type="button" class="mr-4 btn btn-primary" role="button" ><i class="fas fa-wrench" aria-hidden="true"></i></a>';
                    var deleteButton = '<button onclick="deleteUser('+row.userid+')" type="button" class="btn btn-primary"><i class="fas fa-trash" aria-hidden="true"></i></button>'
                    return editButton + deleteButton;

                }

            }],
            data: msg.payload
          })

    })
}

function deleteUser(userid){
    uibuilder.send({
        'topic': 'DELETE FROM user where userid=' + userid +''
    })
}