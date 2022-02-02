const Service = require("../service"); 
const ApiResult = require("../models/api-result"); 
const RestError = require("../models/rest-error");
const HTMLParser = require("../utils/html-parser");
const { request, response } = require("express");

const adm = require("firebase-admin"); 
const app = adm.initializeApp();

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function createUser(name, email, password) { 
    try {
        return await getUserByEmail(email);
    } catch {
        return await app.auth().createUser({
            displayName: name,
            email: email,
            password: "up_"+password,
            disabled: false,
            emailVerified: true
        });
    } 
}

async function getUserByUID(uid) {
    return await app.auth().getUser(uid);
}

async function getUserByEmail(email) {
    return await app.auth().getUserByEmail(email);
}

async function fetchPhoto(request, response) {
    try {  
        let cookie      = request.headers["cookie"];
        let photoPNG    = await downloadPhoto(cookie);

        let headers = {
            "Content-Type": "image/png",
            "Set-Cookie": cookie
        }

        response.status(statusCode).header(headers).end(photoPNG);
    } catch (err) { 
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    } 
}

async function downloadPhoto(cookie) {

    let { status, statusText, data } = await Service.fetchUserRegister(cookie);

    if (status != 200) {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    }

    var imgBase64 = HTMLParser.getElementAttrByClass(data, "img-circle", "src").replace("data:image/gif;base64,", "");
    return Buffer.from(imgBase64, "base64");
}


module.exports = { createUser, getUserByUID, getUserByEmail, fetchPhoto }