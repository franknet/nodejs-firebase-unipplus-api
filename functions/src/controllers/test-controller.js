const { request, response, Router } = require("express")

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

function testGet200(request, response) {
    response.status(200).send({ "message": "ok" });
}

function testPost200(request, response) {
    response.status(200).send({ "message": "ok" });
}

function testGet302(request, response) {
    response.status(302).send({ "message": "sessão expirada!" });
}

function testDownloadPDF(request, response) {
    response.status(200).send({ "message": "sessão expirada!" });
}

module.exports = { 
    testPost200,
    testGet200,
    testGet302,
    testDownloadPDF
}