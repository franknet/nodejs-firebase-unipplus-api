const Service = require("../service"); 
const ApiResult = require("../models/api-result"); 
const HTMLParser = require("../utils/html-parser");
const { request, response } = require("express");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetchPhoto(request, response) {
    try {  
        let cookie = request.headers["cookie"];
        let { statusCode, headers, data } = await downloadPhoto(cookie);

        response.status(statusCode).header(headers).end(data);
    } catch (err) { 
        response.status(404).header({ "Content-Type": "application/json" }).send({ "message": err["stack"] });
    } 
}

async function downloadPhoto(cookie) {

    let { status, statusText, data } = await Service.fetchUserRegister(cookie);

    if (status != 200) {
        return new ApiResult({ statusCode: status, message: statusText});
    }

    var imgBase64 = HTMLParser.getElementAttrByClass(data, "img-circle", "src").replace("data:image/gif;base64,", "");
    let imgData = Buffer.from(imgBase64, "base64");

    let resHeaders = {
        "Content-Type": "image/png"
    }

    return new ApiResult({statusCode: 200, headers: resHeaders, data: imgData});
}


module.exports = { fetchPhoto }