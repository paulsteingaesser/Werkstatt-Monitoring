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