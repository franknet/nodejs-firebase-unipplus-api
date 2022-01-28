const Service = require("../service"); 
const ApiResult = require("../models/api-result"); 
const Factory = require("../factories/disciplines-factory"); 
const HTMLParser = require("../utils/html-parser");
const { request, response } = require("express");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetchDisciplines(request, response) {
    try {
        let cookie = request.headers["cookie"];
        let { statusCode, headers, data } = await fetchGrades(cookie); 
        response.status(statusCode).header(headers).send(data);
    } catch (err) {
        response.status(404).header({ "Content-Type": "application/json" }).send({ "message": err["stack"] });
    }
}

async function fetchGrades(cookie) {
    let { status, statusText, data } = await Service.fetchNF(cookie);

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: statusText});
    } 

    return fetchExams(cookie, data);
}

async function fetchExams(cookie, gradesHtml) {
    let { status, statusText, data } = await Service.fetchME(cookie);

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: statusText});
    } 

    return createDisciplines(gradesHtml, data) 
}

function createDisciplines(gradesHtml, examsHtml) { 
    let nfs = HTMLParser.tableToJsonArray(gradesHtml, ["cod", "discipline", "special", "type", "obs", "np1", "np2", "mf", "obsences"]);  
    let mes = HTMLParser.tableToJsonArray(examsHtml, ["cod", "discipline", "special", "type", "obs", "obsences", "ms", "ex", "mf"]); 
    let disciplines = Factory.createDisciplines(nfs, mes);
    return new ApiResult({ statusCode: 200, data: disciplines });
}

module.exports = { fetchDisciplines }