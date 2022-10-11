const RestError                 = require("../models/rest-error"); 
const _                         = require("lodash");
const Service                   = require("../service");
const { request, response }     = require("express");
const userController            = require("./user-controller"); 
const UserFactory               = require("../factories/user-factory");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response  
 */

async function fetchAuthentication(request, response) {
    try {
        let credentials         = request.body; 
        let { user, cookie }    = await fetchLogin(credentials); 
        let fbUser              = await userController.createUser(user, credentials["password"]);
        
        let headers = {
            "Content-Type": "application/json",
            "Set-Cookie": cookie
        }

        if (fbUser !== null) {
            user["uid"] = fbUser.uid;
        }

        response.status(200).header(headers).send(user);
    } catch (error) { 
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    }
}

async function fetchLogin(credentials) {
    let payload = {
        "identificacao": credentials["id"],
        "senha": credentials["password"]
    }

    let { status, statusText, data } = await Service.fetchLogin(payload);

    if (status != 200) {
        throw new RestError({ statusCode: status, message: statusText }); 
    } 
    
    if (!data["valida"]) {
        throw new RestError({ statusCode: 401, message: data["mensagemInvalida"] });  
    } 

    let user = UserFactory.createUser(data);

    if (user["isEAD"]) {
        return fetchEADLogin(credentials);
    }

    let token = data["token"];
    let cookie = await fetchSystems(token);

    return {
        "cookie": cookie,
        "user": user
    };
}

async function fetchSystems(token) { 
    let authorization = "Basic " + Buffer.from("br.unip.central-aluno:" + token).toString("base64")
    let { status, statusText, data } = await Service.fetchUserSystems(authorization);

    if (status != 200) {
        throw new RestError({statusCode: status, message: statusText }); 
    }
    
    return await fetchSec(data);
} 

async function fetchSec(systems) {

    var sec = _.find(systems, { "id": 142 }); // Local Sec

    if (sec === null || sec === undefined) {
        throw new RestError({statusCode: 403, message: "Sistema não encontrado!" });  
    }

    let { status, statusText, headers } = await Service.fetch(sec["url"], "get");
    
    if (status !== 302) {
        throw new RestError({statusCode: status, message: statusText }); 
    }

    let homeUrl = headers["location"];
    let cookie = headers["set-cookie"];

    return await fetchHome(homeUrl, cookie);
}

async function fetchHome(homeUrl, cookie) { 
    let { status, statusText } = await Service.fetch(homeUrl, "get", { "Cookie": cookie });

    if (status !== 302) {
        throw new RestError({statusCode: status, message: statusText }); 
    }

    return cookie; 
}

// EAD Requests

async function fetchEADLogin(credentials) {  
    let payload = {
        "username": credentials["id"],
        "password": credentials["password"]
    }

    let { status, headers, data } = await Service.fetchEADLogin(payload);

    if (status !== 200) {
        throw new RestError({ statusCode: 401, message: "Usuário ou senha inválidos" }); 
    }

    let cookie = headers["set-cookie"];
    let personId = data["id"];

    return await fetchEADUserData(personId, cookie);
}

async function fetchEADUserData(persionId, cookie) {
    let { status, statusText, data } = await Service.fetchEADUserData(persionId, cookie);

    if (status != 200) {
        throw new RestError({statusCode: status, message: statusText }); 
    }

    let content = data["content"];
    let userData = _.first(content);

    console.log(userData)

    return {
        "cookie": cookie,
        "user": UserFactory.createUser(userData)
    };
}

module.exports = { fetchAuthentication }