function convertMillisToDate(millis){
    var date = new Date(millis);
    return date.toLocaleString('de-DE', {day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'});
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
  
function convertMillisToMinutesSeconds(milliseconds) {

    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);
  
    return seconds === 60
      ? `${minutes + 1}:00 min`
      : `${minutes}:${padTo2Digits(seconds)} min`;
}

function convertMillisToHoursMinutesSeconds(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds + " h";
}

function wattFormatter(value) {
    return value + " W";
}

function kWHFormatter(value) {
    return value + " kWh";
}

function calculateKWHFromRow(value, row) {
    return (row.power * (row.duration / 1000) / 3600000).toFixed(4);
}

function calculateKWH(power, duration) {
    return (power * (duration / 1000) / 3600000).toFixed(4);
}

function calculatePrice(kWH, price) {
    return (kWH * price).toFixed(4) + " €";
}