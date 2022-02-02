const _ = require("lodash");
const NumberUtils = require("../utils/number-parser");

function createAcademicRecords(items) {
    items = _.pullAllBy(items, [{"semester": ""}], "semester") // removes empty objects

    let group = _.groupBy(items, "semester");
    let academicRecords = _.map(group, (value, key) => {
        let { avg, isCursed } = setAvg(value);
        return {
            status: setStatus(isCursed, avg),
            semester: key.replace(".", "") + "º Semestre",
            disciplines: value
        }
    });
    return academicRecords;
}

function setAvg(disciplines) {
    let totalAvg = 0;
    let index = 0;
    _.forEach(disciplines, (discipline) => {
        let { avg, status } = discipline;
        
        if (_.includes(["CURSANDO NORMAL", "NÃO CURSADA", "A CURSAR"], status) ) {
            discipline["avg"] = NumberUtils.stringToFloat(avg);
            return;
        }
        if (avg === "--" && status === "APROVADO" ) {
            avg = "10"
        }
        let avgFlt = NumberUtils.stringToFloat(avg);
        discipline["avg"] = avgFlt;
        totalAvg += avgFlt;
        index++;
    });
    return {
        isCursed: index > 0,
        avg: _.round(totalAvg / index, 1)
    }
}

function setStatus(isCursed, avg) {
    var message;
    var code = 0;
    if (!isCursed) {
        message = "Aguardando lançamento das médias";
    } else if (avg > 7.9) {
        message =  "Seu aproveitamento está ótimo!";
        code = 1
    } else if (NumberUtils.inRange(avg, 7.9, 6)) {
        message =  "Seu aproveitamento está bom!";
        code = 2
    } else if (NumberUtils.inRange(avg, 5.9, 5)) {
        message = "Seu aproveitamento está mediano!";
        code = 4
    } else if (NumberUtils.inRange(avg, 4.9, 4)) {
        message = "Seu aproveitamento está ruim!";
        code = 4
    } else {
        message = "Seu aproveitamento está muito ruim!";
        code = 5
    }
    return {
        avg: avg,
        message: message,
        code: code
    }
}

module.exports = { createAcademicRecords }