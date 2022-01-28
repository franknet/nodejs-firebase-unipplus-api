const ApiResult                         = require("../models/api-result");
const Service                           = require("../service");
const Factory                           = require("../factories/academic-records-factory"); 
const HTMLParser                        = require("../utils/html-parser");
const { request, response, Router }     = require("express"); 

/**
 * @param {request} request - The express request
 * @param {response} response - The express response 
 */

async function fetch(request, response) {
    try {
        let cookie = request.headers["cookie"];
        let { statusCode, headers, data } = await fetchAcademicRecords(cookie);

        response.status(statusCode).header(headers).send(data);
    } catch (err) {
        response.status(404).header({ "Content-Type": "application/json" }).send({ "message": err["stack"] });
    }
}

async function fetchAcademicRecords(cookie) {
    let { status, statusText, data } = await Service.fetchAcademicRecords(cookie);

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: statusText});
    } 

    return createDisciplines(data);
}

function createDisciplines(html) {
    let fields = ["semester", "code", "name", "workload", "avg", "year", "status"];
    let disciplines = HTMLParser.tableToJsonArray(html, fields); 
    let academic_records = Factory.createAcademicRecords(disciplines);
    return new ApiResult({ statusCode: 200, data: academic_records });
}

module.exports = { fetch }