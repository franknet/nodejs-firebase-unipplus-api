const Service                   = require("../../service"); 
const RestError                 = require("../../models/rest-error");
const Factory                   = require("../../factories/disciplines-factory"); 
const HTMLParser                = require("../../utils/html-parser");
const { request, response }     = require("express");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetchDisciplines(request, response) {
    try {
        let cookie = request.headers["cookie"]; 
        if (cookie === undefined) {
            throw new RestError({ statusCode: 302, message: "Sessão expirada" });
        } 
        let gradesHTML      = await fetchGrades(cookie); 
        let examsHTML       = await fetchExams(cookie); 
        let headers = {
            "Content-Type": "application/json"
        }
        response.status(200).header(headers).send("OK");
    } catch (error) {
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    }
}

async function fetchGrades(cookie) {
    let { statusCode, statusText, data } = await Service.fetchNF(cookie);

    if (statusCode === 200) {
        return data
    } else if (statusCode === 302) {
        throw new RestError({ statusCode: statusCode, message: "Sessão expirada!" }); 
    } else {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    }
}

async function fetchExams(cookie) {
    let { statusCode, statusText, data } = await Service.fetchME(cookie);

    if (statusCode === 200) {
        return data
    } else if (statusCode === 302) {
        throw new RestError({ statusCode: statusCode, message: "Sessão expirada!" }); 
    } else {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    }
}

function createDisciplines(gradesHtml, examsHtml) { 
    let nfs = HTMLParser.tableToJsonArray(gradesHtml, ["cod", "discipline", "special", "type", "obs", "np1", "np2", "mf", "obsences"]);  
    let mes = HTMLParser.tableToJsonArray(examsHtml, ["cod", "discipline", "special", "type", "obs", "obsences", "ms", "ex", "mf"]); 
    return Factory.createDisciplines(nfs, mes);
}

module.exports = { fetchDisciplines }