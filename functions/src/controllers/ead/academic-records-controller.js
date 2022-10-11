
const RestError                 = require("../models/rest-error");
const Service                   = require("../service");
const Factory                   = require("../factories/academic-records-factory"); 
const HTMLParser                = require("../utils/html-parser");
const { request, response }     = require("express"); 

/**
 * @param {request} request - The express request
 * @param {response} response - The express response 
 */

async function fetch(request, response) {
    try {
        let cookie              = request.headers["cookie"];
        if (cookie == undefined) {
            throw new RestError({ statusCode: 302, message: "Sessão expirada" });
        }
        let academicRecodsHTML  = await fetchAcademicRecords(cookie);
        let disciplines         = createDisciplines(academicRecodsHTML);

        let headers = {
            "Content-Type": "application/json"
        }

        response.status(200).header(headers).send(disciplines);
    } catch (error) {
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    }
}

async function fetchAcademicRecords(cookie) {
    let { status, statusText, data } = await Service.fetchAcademicRecords(cookie);

    if (status === 200) {
        return data
    } else if (status === 302) {
        throw new RestError({ statusCode: statusCode, message: "Sessão expirada!" }); 
    } else {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    }
}

function createDisciplines(html) {
    let fields = ["semester", "code", "name", "workload", "avg", "year", "status"];
    let disciplines = HTMLParser.tableToJsonArray(html, fields); 
    return Factory.createAcademicRecords(disciplines);
}

module.exports = { fetch }