/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict'

function stringFormat(str) {
    return str.replace(/['"]+/g, '');
}
 
// run this function when the document is loaded
window.onload = function() {

    
    var wb = XLSX.utils.book_new();
                                    
    wb.Props = {
        Title: "SheetJS Tutorial",
        Subject: "Test",
        Author: "Red Stapler",
        CreatedDate: new Date(2017,12,19)
    };

    wb.SheetNames.push("Test Sheet");

    var ws_data;
    var ws;
    var wbout;

    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()
    uibuilder.send({
        'topic': "SELECT *  FROM user"
    })
    // Listen for incoming messages from Node-RED
    uibuilder.onChange('msg', function(msg){
        console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)

        ws_data = msg.payload;
        ws = XLSX.utils.json_to_sheet(ws_data);
        wb.Sheets["Test Sheet"] = ws;

        wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    });

    /*
    ws_data = [
        {UserID: "100", Passwort: "12345", Nachname: "Konto", Vorname: "Werkstatt", Admin: 1, Berechtigung: 3, Firma: ""},
        {UserID: "101", Passwort: "", Nachname: "Doe", Vorname: "John", Admin: 0, Berechtigung: 2, Firma: ""},
        {UserID: "102", Passwort: "jantorge", Nachname: "Schneider", Vorname: "Jan", Admin: 1, Berechtigung: 2, Firma: "HAW"}
    ];
    */
    
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }

    
    $("#button-a").click(function(){
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'test.xlsx');
    });

}
