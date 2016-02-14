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
