/* eslint-disable strict */
/* jshint browser: true, esversion: 6, asi: true */
/* globals uibuilder */
// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED */
'use strict'

const MessageType = {
    getUserNames: "getUserNames",
    getMachineNames: "getMachineNames",
    getDataForThisMonth: "getDataForThisMonth",
    getDataForSelected: "getDataForSelected"
}

var startDatePicker;
var endDatePicker;

function stringFormat(str) {
    return str.replace(/['"]+/g, '');
}
 
// run this function when the document is loaded
window.onload = function() {

    setDatePicker();

    // Start up uibuilder - see the docs for the optional parameters
    uibuilder.start()

    getAllDataForThisMonth();

    getUserAndMachines();
}

// Listen for incoming messages from Node-RED
uibuilder.onChange('msg', function(msg){

    console.info('[indexjs:uibuilder.onChange] msg received from Node-RED server:', msg)
    
    if(msg.messageType == MessageType.getDataForThisMonth || msg.messageType == MessageType.getDataForSelected){

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
                field: 'lastName',
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
    }   
   

    if(msg.messageType == MessageType.getDataForThisMonth){

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

    if(msg.messageType == MessageType.getUserNames){
        fillUserDropdown(msg.payload);
    }

    if(msg.messageType == MessageType.getMachineNames){
        fillMachineDropdown(msg.payload);
    }
    
});


function getUserAndMachines(){

    var querry = "SELECT userid, firstName, lastName FROM user";

    uibuilder.send({
        'topic': querry,
        'messageType': MessageType.getUserNames
    });

    querry = "SELECT machineName FROM machine";

    uibuilder.send({
        'topic': querry,
        'messageType': MessageType.getMachineNames
    });
}

function getAllDataForSelected() {

    var querry;

    var selectedUserid = document.getElementById("userDropdown").value;

    var e = document.getElementById("machineDropdown");
    var selectedMachine = e.options[e.selectedIndex].text;

    if(selectedMachine == "Alle" && selectedUserid == 0){

        querry = "SELECT * FROM data INNER JOIN user ON data.userid = user.userid WHERE start >= " + new Date(startDatePicker.value).getTime() + " AND start <= " + new Date(endDatePicker.value).getTime() + " ORDER BY start";

    }else if(selectedUserid != 0 && selectedMachine == "Alle"){

        querry = "SELECT * FROM data INNER JOIN user ON data.userid = user.userid WHERE user.userid = "+ selectedUserid +" AND start >= " + new Date(startDatePicker.value).getTime() + " AND start <= " + new Date(endDatePicker.value).getTime() + " ORDER BY start";

    }else if(selectedUserid == 0 && selectedMachine != "Alle"){

        querry = "SELECT * FROM data INNER JOIN user ON data.userid = user.userid WHERE data.machineName = '"+ selectedMachine +"' AND start >= " + new Date(startDatePicker.value).getTime() + " AND start <= " + new Date(endDatePicker.value).getTime() + " ORDER BY start";

    }else{

        querry = "SELECT * FROM data INNER JOIN user ON data.userid = user.userid WHERE user.userid = "+ selectedUserid +" AND data.machineName = '"+ selectedMachine +"' AND start >= " + new Date(startDatePicker.value).getTime() + " AND start <= " + new Date(endDatePicker.value).getTime() + " ORDER BY start";
    }

    uibuilder.send({
        'topic': querry,
        'messageType': MessageType.getDataForSelected
    });
}

function getAllDataForThisMonth() {

    var querry = "SELECT * FROM data INNER JOIN user ON data.userid = user.userid WHERE start >= " + new Date(startDatePicker.value).getTime() + " AND start <= " + new Date(endDatePicker.value).getTime() + " ORDER BY start";

    uibuilder.send({
        'topic': querry,
        'messageType': MessageType.getDataForThisMonth
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
    overViewData[0].wattHours = (sumWatt).toFixed(2);
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

function fillUserDropdown(userArray){

    var select = document.getElementById("userDropdown");

    var opt = document.createElement("option");
    opt.value = 0;
    opt.innerHTML = "Alle";

    select.appendChild(opt);

    userArray.forEach(user => {
        var opt = document.createElement("option");
        opt.value = user.userid;
        opt.innerHTML = user.firstName + " " + user.lastName;

        select.appendChild(opt);
    });
};

function fillMachineDropdown(machineArray){

    var select = document.getElementById("machineDropdown");

    var opt = document.createElement("option");
    opt.innerHTML = "Alle";

    select.appendChild(opt);

    machineArray.forEach(function callback(machine, index){
        var opt = document.createElement("option");
        opt.value = index;
        opt.innerHTML = machine.machineName;

        select.appendChild(opt);
    });
};
