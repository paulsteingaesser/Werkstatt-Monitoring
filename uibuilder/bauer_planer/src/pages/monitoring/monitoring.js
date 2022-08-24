/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict'

var startDatePicker;
var endDatePicker;

function stringFormat(str) {
    return str.replace(/['"]+/g, '');
}
 
// run this function when the document is loaded
window.onload = function() {

    setDatePicker();
    console.log(getSelectedDateRangeAsString());

    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()

    getDataForSelectedTime(true);


    
    $("#button-a").click(function(){
       
    });

}

// Listen for incoming messages from Node-RED
uibuilder.onChange('msg', function(msg){
    console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)
    
    $('#dataTable').bootstrapTable({
        columns: [{
            field: 'userid',
            title: 'UserID',
            sortable: "true"
        },{
            field: 'firstName',
            title: 'Vorname',
            sortable: "true"
        },{
            field: 'lastname',
            title: 'Nachname',
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
            formatter: "calculateKWHFromRow"
        },{
            field: 'company',
            title: 'Firma',
            sortable: "true"
        },]
    });
    
    $('#dataTable').bootstrapTable("load", msg.payload);

    if(msg.initial){

        var overViewData = createOverviewDataObject(msg.payload);

        $('#overviewTable').bootstrapTable({
            columns: [{
                field: 'machineHours',
                title: 'Maschinenstunden',
            }, {
                field: 'wattHours',
                title: 'Wattstunden',
                formatter: "kWHFormatter"
            }, {
                field: 'powerCosts',
                title: 'Stromkosten (' + localStorage.getItem("powerCost") + " €/kWh)",
            }],
            data: overViewData
        });
    }
    
});

function getDataForSelectedTime(init) {

    var querryForDataTable = "SELECT * FROM data INNER JOIN user ON data.userid = user.userid WHERE start >= " + new Date(startDatePicker.value).getTime() + " AND start <= " + new Date(endDatePicker.value).getTime() + " ORDER BY start";

    uibuilder.send({
        'topic': querryForDataTable,
        'initial': init
    });
}


function setDatePicker() {
    
    startDatePicker = document.getElementById("start");
    endDatePicker = document.getElementById("end");

    var date = new Date();
    endDatePicker.valueAsDate = date;
    date.setDate(1);
    //TODO das muss noch raus
    date.setMonth(0);
    date.setFullYear(2000);
    startDatePicker.valueAsDate = date;
}

function getSelectedDateRangeAsString() {
    var startDate = new Date(startDatePicker.value);
    var endData = new Date(endDatePicker.value);
    return startDate.getDate()+"."+(startDate.getMonth()+1)+"."+startDate.getFullYear()+"-"+endData.getDate()+"."+(endData.getMonth()+1)+"."+endData.getFullYear();
}

function createOverviewDataObject(array){

    var overViewData = [{
        machineHours: "",
        wattHours: "",
        powerCosts: ""
    }];

    var sumMachineHours = 0;
    var sumWatt = 0;

    array.forEach(element => {
        sumMachineHours = sumMachineHours + element.duration;
        sumWatt = sumWatt + Number(calculateKWH(element.power, element.duration));
    });
    overViewData[0].machineHours = convertMillisToHoursMinutesSeconds(sumMachineHours);
    overViewData[0].wattHours = sumWatt;
    overViewData[0].powerCosts = calculatePrice(overViewData[0].wattHours, localStorage.getItem("powerCost"));

    return overViewData;
}

function exportXLSX(){

    var workBook = XLSX.utils.book_new();                               
    workBook.Props = {
        Title: "Übersicht für ausgewählten Zeitraum",
        Author: localStorage.getItem("fullName"),
        CreatedDate: new Date()
    };

    workBook.SheetNames.push("Übersicht_"+getSelectedDateRangeAsString());

    var workSheet;
    var workBookOut;
    
    workSheet = XLSX.utils.table_to_sheet(document.getElementById("dataTable"));
    workBook.Sheets["Übersicht_"+getSelectedDateRangeAsString()] = workSheet;

    workBookOut = XLSX.write(workBook, {bookType:'xlsx',  type: 'binary'});
    
    saveAs(new Blob([s2ab(workBookOut)],{type:"application/octet-stream"}), 'Uebersicht_'+getSelectedDateRangeAsString()+'.xlsx');
}

//Helper function
function s2ab(s) {

    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}