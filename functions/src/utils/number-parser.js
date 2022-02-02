
function stringToFloat(value) {
    value = value.replace(".", "").replace(",", ".");
    if (value === "AP") {
        value = "10.0";
    }
    let flt = parseFloat(value)
    if (isNaN(flt)) {
        return 0.0
    } 
    return flt
}

function inRange(num, max, min) {
    return num <= max && num >= min
}

function isNumber(text) {
    text = text.replace(".", "").replace(",", ".");
    let flt = parseFloat(text);
    return !isNaN(flt);
}

module.exports = { stringToFloat, inRange, isNumber }