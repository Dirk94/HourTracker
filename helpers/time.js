module.exports.validTime = function(time) {
    if (time == undefined) {
        return false;
    }
    var n = time.search(/^\d\d:\d\d$/);
    return n >= 0;
}

module.exports.validDate = function(date) {
    if (date == undefined) {
        return false;
    }
    var n = date.search(/^\d\d-\d\d-\d\d\d\d$/);
    return n >= 0;
}

module.exports.getHourDifference = function(time1, time2) {
    var hourStart = new Date("01/01/2007 " + time1).getHours();
    var hourEnd = new Date("01/01/2007 " + time2).getHours();

    var hours = Math.floor(hourEnd - hourStart);

    var minuteStart = new Date("01/01/2007 " + time1).getMinutes();
    var minuteEnd = new Date("01/01/2007 " + time2).getMinutes();

    var minutes = minuteEnd - minuteStart;
    var fraction = minutes / 60;

    return hours + fraction;
}
