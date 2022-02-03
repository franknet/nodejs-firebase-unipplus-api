
const RestError                 = require("../models/rest-error");
const Service                   = require("../service");
const Factory                   = require("../factories/finance-factory");
const HTMLParser                = require("../utils/html-parser"); 
const { request, response }     = require("express");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetchPayments(request, response) {
    try {
        let cookie          = request.headers["cookie"];
        let extractsHTML    = await fetchExtract(cookie);
        let billsHTML       = await fetchBills(cookie);
        let payments        = createPaymentsModel(extractsHTML, billsHTML);

        let headers = {
            "Content-Type": "application/json"
        }

        response.status(200).header(headers).send(payments);
    } catch (error) {
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    }
}

async function fetchExtract(cookie) {
    let { status, statusText, data } = await Service.fetchPayments(cookie);

    if (status === 200) {
        return data
    } else if (status === 302) {
        throw new RestError({ statusCode: statusCode, message: "Sessão expirada!" }); 
    } else {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    } 
}

async function fetchBills(cookie) {
    let { status, statusText, data } = await Service.fetchBankSlips(cookie);

    if (status === 200) {
        return data
    } else if (status === 302) {
        throw new RestError({ statusCode: statusCode, message: "Sessão expirada!" }); 
    } else {
        throw new RestError({ statusCode: statusCode, message: statusText }); 
    }
}

function createPaymentsModel(extractsHtml, billsHtml) {
    let extractFields = ["seq", "install", "docType", "paymentPlan", "dueDate", "docValue", "paymentDate", "valuePaid", "reversalValue", "status", "receipt"];
    let billsFields = ["seq", "install", "docType", "paymentPlan", "dueDate", "docValue", "paymentDate", "valuePaid", "reversalDate", "reversalValue","status", "bankSlipUrl"];
    let extract = HTMLParser.tableToJsonArray(extractsHtml, extractFields);
    let bills = HTMLParser.tableToJsonArray(billsHtml, billsFields);
    return Factory.createPayments(extract, bills); 
}

async function fetchBankSlip(request, response) {
    try {
        let cookie          = request.headers["cookie"];
        let billId          = request.query["id"];
        let bankSlipURL     = await fetchBankSlipURL(cookie, billId);
        let bankSlipParams  = await fetchBankSlipParams(cookie, bankSlipURL);
        let bankSlipPDF     = await downloadBankSlipPDF(cookie, bankSlipURL, bankSlipParams);

        let headers = {
            "Content-Type": "application/pdf",
            "Set-Cookie": cookie
        }

        response.status(200).header(headers).send(bankSlipPDF);
    } catch (error) {
        let restError = new RestError({ error });
        response.status(restError.statusCode).header(restError.headers).send(restError.data);
    }
}

async function fetchBankSlipURL(cookie, billId) {
    let { status, headers } = await Service.fetchBankSlip(cookie, billId);

    if (status !== 302) {
        throw new RestError({ statusCode: statusCode, message: "Não foi possível baixar o boleto!" });  
    } 

    return headers["location"];
}

async function fetchBankSlipParams(cookie, path) { 
    let { status, data } = await Service.fetch(path, "get", { "Cookie": cookie }, null, null);

    if (status !== 200) {
        throw new RestError({ statusCode: statusCode, message: "Não foi possível baixar o boleto!" }); 
    } 

    let params = new URLSearchParams();
    params.append("__VIEWSTATE", HTMLParser.getElementValueById(data, "__VIEWSTATE"));
    params.append("__VIEWSTATEGENERATOR", HTMLParser.getElementValueById(data, "__VIEWSTATEGENERATOR"));
    params.append("Button1", "Ir para impressão");

    return params;
}


async function downloadBankSlipPDF(cookie, path, payload) {  
    let { status, data } = await Service.fetch(path, "post", { "Cookie": cookie }, null, payload, "arraybuffer");

    if (status !== 200) {
        throw new RestError({ statusCode: statusCode, message: "Não foi possível baixar o boleto!" }); 
    } 

    return data;
}

module.exports = { fetchPayments, fetchBankSlip }
