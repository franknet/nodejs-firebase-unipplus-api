const _ = require("lodash");
const NumberUtils = require("../utils/number-parser");

function createDisciplines(nfs, mes) {
    let count = 0;
    let totalAvg = 0;
    const disciplines = _.merge(nfs, mes);
    
    _.forEach(disciplines, (discipline) => {
        buildDisciplineAvg(discipline);
        if (discipline.released) {
            count++;
            totalAvg += discipline.avg;
        }
        buildDisciplineStatus(discipline);
    });
    const group = _.groupBy(disciplines, "type");
    const groups = _.map(group, (value, key) => {
        const obj = {
            type: key,
            disciplines: value
        };
        return obj;
    });
    return {
        status: buildDisciplinesStatus(count > 0, totalAvg / count),
        disciplines: groups
    };
}

function buildDisciplineAvg(discipline) { 
    let { np1, np2, mf } = discipline;
    let np1_flt = NumberUtils.stringToFloat(np1);
    let np2_flt = NumberUtils.stringToFloat(np2);
    let mf_flt = NumberUtils.stringToFloat(mf);
    let avg = 0;
    if (mf === "AP") {
        discipline["released"] = true;
        discipline["avg"] = 10;
        return;
    }
    let np1Released = NumberUtils.isNumber(np1) || np1 === "NC";
    if (np1Released) {
        avg = (np1_flt + 10) / 2;
    }
    let np2Released = NumberUtils.isNumber(np2) || np2 === "NC";
    if (np2Released) {
        avg = (np1Released ? np1_flt : 10 + np2_flt) / 2;
    }
    if (NumberUtils.isNumber(mf)) {
        avg = mf_flt;
    }
    discipline["released"] = np1Released || np2Released;
    discipline["avg"] = _.round(avg, 1);
}

function buildDisciplineStatus(discipline) {
    let { np1, np2, ms, ex, mf } = discipline;
    let np1_flt = NumberUtils.stringToFloat(np1);
    let np2_flt = NumberUtils.stringToFloat(np2);
    let ms_flt = NumberUtils.stringToFloat(ms);
    let ex_flt = NumberUtils.stringToFloat(ex);
    let mf_flt = NumberUtils.stringToFloat(mf);

    discipline["np1"] = np1_flt;
    discipline["np2"] = np2_flt;
    discipline["ms"] = ms_flt;
    discipline["ex"] = ex_flt;
    discipline["mf"] = mf_flt;
    discipline["status"] = { messages: [], code: 0 }

    if (mf === "AP" || (!NumberUtils.isNumber(np1) && !NumberUtils.isNumber(np1) && mf_flt >= 5)) {
        discipline.status.code = 1;
        discipline.status.messages.push("Aprovado");
        return;
    }
    if (!NumberUtils.isNumber(np1)) {
        discipline.status.messages.push("Aguardando NP1");
        return;
    }
    if (np1 === "NC") {
        discipline.status.messages.push("Você não compareceu na prova da NP1");
    } else if (!NumberUtils.isNumber(np2)) {
        discipline.status.messages.push("Aguardando NP1");
        return;
    }
    let needed = ((7 + np1_flt) / 2) + np1_flt;
    if (needed <= 10) {
        discipline.status.messages.push("Você precisa tirar no mínimo " + _.round(needed, 1) + " na NP2");
    }
    if (np2 === "NC") {
        discipline.status.messages.push("Você não compareceu na prova da NP2");
    } else if (!NumberUtils.isNumber(ms)) {
        discipline.status.messages.push("Aguardando média semestral")
        return;
    }
    if (ms_flt < 7 && mf_flt < 7) {
        needed = 10 - ms_flt;
        discipline.status.messages.push("Você precisa tirar no mínimo " + _.round(needed, 1) + " no Exame");
    }
    if (mf_flt < 7 && !NumberUtils.isNumber(ex)) {
        discipline.status.messages.push("Aguardando nota do exame")
        return;
    }
    if (mf_flt >= 5) {
        discipline.status.code = 1;
        discipline.status.messages.push("Aprovado");
    } else {
        discipline.status.code = 2;
        discipline.status.messages.push("Reprovado");
    }
}

function buildDisciplinesStatus(released, avg) {
    var message = "";
    var code = 0;
    if (!released) {
        message = "Aguardando lançamento das notas";
    } else if (avg > 7.9) {
        message = "Seu aproveitamento está ótimo!";
        code = 1;
    } else if (NumberUtils.inRange(avg, 7.9, 6)) {
        message = "Seu aproveitamento está bom!";
        code = 2;
    } else if (NumberUtils.inRange(avg, 5.9, 4)) {
        message = "Seu aproveitamento está ruim!";
        code = 3;
    } else {
        message = "Seu aproveitamento está muito ruim!";
        code = 4;
    }
    return {
        avg: _.round(avg, 1),
        message: message,
        code: code
    }
}

module.exports = { createDisciplines }