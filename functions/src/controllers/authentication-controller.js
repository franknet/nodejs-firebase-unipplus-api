const ApiResult = require("../models/api-result"); 
const _ = require("lodash");
const Service = require("../service");
const { request, response } = require("express");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetch(request, response) {
    try {
        let credentials = request.body;
        let { statusCode, headers, data } = await fetchLogin(credentials);  
        response.status(statusCode).header(headers).send(data);
    } catch (err) { 
        response.status(404).header({ "Content-Type": "application/json" }).send({ "message": err["stack"] });
    }
}

async function fetchLogin(credentials) {
    let form = {
        "identificacao": credentials["id"],
        "senha": credentials["password"]
    }

    let { status, statusText, data } = await Service.fetchLogin(form);

    if (status != 200) {
        return new ApiResult({ statusCode: status, message: statusText });
    } 
    
    if (!data["valida"]) {
        return new ApiResult({ statusCode: 301, message: data["mensagemInvalida"]}); 
    } 

    return await fetchSystems(data);
}

async function fetchSystems(session) { 
    let authorization = "Basic " + Buffer.from("br.unip.central-aluno:" + session["token"]).toString("base64")
    let { status, statusText, data } = await Service.fetchUserSystems(authorization);

    if (status != 200) {
        return new ApiResult({ statusCode: status, message: statusText });
    }

    return await fetchSec(session, data);
} 

async function fetchSec(session, systems) {

    let sec = _.find(systems, { "id": 142 });

    if (sec === null) {
        return new ApiResult({ statusCode: 401, message: "Sistema não encontrado!" });
    }

    let { status, statusText, headers } = await Service.fetch(sec["url"], "get");
    
    if (status != 302) {
        return new ApiResult({ statusCode: status, message: statusText });
    }

    let location = headers["location"];
    let cookie = headers["set-cookie"];

    return await fetchNewHome(session, location, cookie);
}

async function fetchNewHome(session, url, cookie) {
    let { status, statusText } = await Service.fetch(url, "get", { "Cookie": cookie });

    if (status != 302) {
        return new ApiResult({ statusCode: status, message: statusText });
    }

    let apiHeaders = {
        "Content-Type": "application/json",
        "Set-Cookie": cookie
    }

    let data = {
        "session": {
            "user": {
                "id": session["identificacao"],
                "userName": session["nomeUsuario"], 
                "status": session["situacao"],
                "gender": session["sexo"],
                "campus": session["unidade"]
            }
        }
    }

    return new ApiResult({ statusCode: 200, data: data, headers: apiHeaders });
}

module.exports = { fetch }