
const cheerio = require("cheerio");
const _ = require("lodash");

function tableToJsonArray(html, keys) {
    var jsonArray = [];

    let $ = cheerio.load(html);
    let table = $(".table-striped").first();
    var trs = table.find("tr");
    trs = trs.slice(1);
    
    function tdsInteractor(i, td) { 
        var value = $(td).text().trim();
        if (_.isEmpty(value)) {
            value = $(td).html().trim();
        }
        _.last(jsonArray)[keys[i]] = value; 
    }

    function trsInteractor(i, tr) { 
        jsonArray.push({});
        let tds = $(tr).find("td");
        tds.each(tdsInteractor);
    }

    trs.each(trsInteractor);

    return jsonArray;
}

function getElementValueById(html, id) {
    let $ = cheerio.load(html);
    return $("#" + id).val(); 
}

function getElementAttrByClass(html, class_name, attr) {
    let $ = cheerio.load(html);
    return $("." + class_name).first().attr(attr);
}

module.exports = { tableToJsonArray, getElementValueById, getElementAttrByClass }