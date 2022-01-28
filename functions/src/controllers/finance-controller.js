const ApiResult = require("../models/api-result");
const Service = require("../service");
const Factory = require("../factories/finance-factory");
const HTMLParser = require("../utils/html-parser"); 
const { request, response } = require("express");

/**
 * @param {request} request - The express request
 * @param {response} response - The express response
 */

async function fetchPayments(request, response) {
    try {
        let cookie = request.headers["cookie"];
        let { statusCode, headers, data } = await fetchExtract(cookie);
        response.status(statusCode).header(headers).send(data);
    } catch (err) {
        response.status(404).header({ "Content-Type": "application/json" }).send({ "message": err["message"] });
    }
}

async function fetchExtract(cookie) {
    let { status, statusText, data } = await Service.fetchPayments(cookie);

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: statusText });
    } 

    return await fetchBills(cookie, data);
}

async function fetchBills(cookie, extracts) {
    let { status, statusText, data } = await Service.fetchBankSlips(cookie);

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: statusText});
    } 

    return createPaymentsModel(extracts, data);
}

function createPaymentsModel(extractsHtml, billsHtml) {
    let extractFields = ["seq", "install", "docType", "paymentPlan", "dueDate", "docValue", "paymentDate", "valuePaid", "reversalValue", "status", "receipt"];
    let billsFields = ["seq", "install", "docType", "paymentPlan", "dueDate", "docValue", "paymentDate", "valuePaid", "reversalDate", "reversalValue","status", "bankSlipUrl"];
    let extract = HTMLParser.tableToJsonArray(extractsHtml, extractFields);
    let bills = HTMLParser.tableToJsonArray(billsHtml, billsFields);
    let payments = Factory.createPayments(extract, bills);
    return new ApiResult({ statusCode: 200, data: payments });
}

async function fetchBankSlip(request, response) {
    try {
        let cookie = request.headers["cookie"];
        let billId = request.query["id"];
        let { statusCode, headers, data } = await fetchBankSlipGeneration(cookie, billId);
        response.status(statusCode).header(headers).send(data);
    } catch (err) {
        response.status(404).header({ "Content-Type": "application/json" }).send({ "message": err["stack"] });
    }
}

async function fetchBankSlipGeneration(cookie, billId) {
    let { status, headers } = await Service.fetchBankSlip(cookie, billId);

    if (status !== 302) {
        return new ApiResult({ statusCode: status, message: "Não foi possível baixar o boleto!"});
    } 

    let location = headers["location"];

    return await validateBankSlip(cookie, location);
}

async function validateBankSlip(cookie, path) { 
    let { status, data } = await Service.fetch(path, "get", { "Cookie": cookie }, null, null);

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: "Não foi possível baixar o boleto!"});
    } 

    let payload = new URLSearchParams();
    payload.append("__VIEWSTATE", HTMLParser.getElementValueById(data, "__VIEWSTATE"));
    payload.append("__VIEWSTATEGENERATOR", HTMLParser.getElementValueById(data, "__VIEWSTATEGENERATOR"));
    payload.append("Button1", "Ir para impressão");

    return await downloadBankSlip(cookie, path, payload);
}


async function downloadBankSlip(cookie, path, payload) {  
    let { status, data, headers } = await Service.fetch(path, "post", { "Cookie": cookie }, null, payload, "arraybuffer");

    if (status !== 200) {
        return new ApiResult({ statusCode: status, message: "Não foi possível baixar o boleto!"});
    } 

    return new ApiResult({ statusCode: 200, headers: headers, data: data });
}

module.exports = { fetchPayments, fetchBankSlip }
