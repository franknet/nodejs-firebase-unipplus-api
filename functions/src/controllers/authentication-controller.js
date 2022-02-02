const RestError = require("../models/rest-error"); 
const _ = require("lodash");
const Service = require("../service");
const { request, response } = require("express");
const userController = require("./user-controller"); 

/**
 * @param {request} request - The express request
 * @param {response} response - The express response  
 */

async function fetchAuthentication(request, response) {
    try {
        let credentials     = request.body;
        let session         = await fetchLogin(credentials);  
        let systems         = await fetchSystems(session);
        let cookie          = await fetchSec(systems);
        let user            = await userController.createUser(session["nomeUsuario"], session["email"], credentials["password"]);

        let headers = {
            "Content-Type": "application/json",
            "Set-Cookie": cookie
        }
    
        let data = {
            "session": {
                "user": {
                    "uid": user.uid,
                    "id": session["identificacao"],
                    "userName": session["nomeUsuario"], 
                    "status": session["situacao"],
                    "gender": session["sexo"],
                    "campus": session["unidade"]
                }
            }
        }

        response.status(200).header(headers).send(data);
    } catch (error) { 
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    }
}

async function fetchLogin(credentials) {
    let form = {
        "identificacao": credentials["id"],
        "senha": credentials["password"]
    }

    let { status, statusText, data } = await Service.fetchLogin(form);

    if (status != 200) {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    } 
    
    if (!data["valida"]) {
        throw new RestError({ statusCode: 301, message: data["mensagemInvalida"] });  
    } 

    return data; 
}

async function fetchSystems(session) { 
    let authorization = "Basic " + Buffer.from("br.unip.central-aluno:" + session["token"]).toString("base64")
    let { status, statusText, data } = await Service.fetchUserSystems(authorization);

    if (status != 200) {
        throw new RestError({statusCode: statusCode, message: statusText }); 
    }

    return data;
} 

async function fetchSec(systems) {

    let sec = _.find(systems, { "id": 142 });

    if (sec === null) {
        throw new RestError({statusCode: 401, message: "Sistema não encontrado!" });  
    }

    let { status, statusText, headers } = await Service.fetch(sec["url"], "get");
    
    if (status != 302) {
        throw new RestError({statusCode: statusCode, message: statusText }); 
    }

    let location = headers["location"];
    let cookie = headers["set-cookie"];

    return await fetchHome(location, cookie);
}

async function fetchHome(url, cookie) {
    let { status, statusText } = await Service.fetch(url, "get", { "Cookie": cookie });

    if (status != 302) {
        throw new RestError({statusCode: statusCode, message: statusText }); 
    }

    return cookie; 
}

module.exports = { fetchAuthentication }