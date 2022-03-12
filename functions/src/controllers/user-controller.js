const Service                   = require("../service");
const RestError                 = require("../models/rest-error");
const HTMLParser                = require("../utils/html-parser");
const { request, response }     = require("express");
const adm                       = require("firebase-admin");  
const app                       = adm.initializeApp();

async function createUser(secUser, password) { 
    let user = getUserByEmail(secUser["email"]);
    if (user !== null) {
        return user;
    }

    try {
        return await app.auth().createUser({
            displayName: secUser["nomeUsuario"],
            email: secUser["email"],
            password: "up_" + password,
            disabled: false,
            emailVerified: true
        });
    } catch(error) {
        console.error(error["stack"]);
        return null; 
    } 
}

async function getUserByUID(uid) {
    try {
        return await app.auth().getUser(uid);
    } catch {
        return null;
    }
}

async function getUserByEmail(email) {
    try {
        return await app.auth().getUserByEmail(email);
    } catch {
        return null;
    }
}

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetchPhoto(request, response) {
    try {  
        let cookie      = request.headers["cookie"];
        if (cookie == undefined) {
            throw new RestError({ statusCode: 302, message: "Sessão expirada" });
        }
        let photoPNG    = await downloadPhoto(cookie);
        let headers = {
            "Content-Type": "image/png"
        }
        response.status(200).header(headers).end(photoPNG);
    } catch (error) { 
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    } 
}

async function downloadPhoto(cookie) {

    let { status, statusText, data } = await Service.fetchUserRegister(cookie);

    if (status != 200) {
        throw new RestError({ statusCode: status, message: statusText }); 
    }

    var imgBase64 = HTMLParser.getElementAttrByClass(data, "img-circle", "src").replace("data:image/gif;base64,", "");
    return Buffer.from(imgBase64, "base64");
}


module.exports = { createUser, getUserByUID, getUserByEmail, fetchPhoto }