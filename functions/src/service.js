const HttpClient = require("axios").default;  

const IS_REQUEST_LOGGING_ENABLED = true;

const ORIGINS = {
    SYSTEMS: "https://sistemasunip.unip.br",
    SEC_2: "https://sec2.unip.br"
}

const PATHS = {
    LOGIN: "/api-autenticacao/autenticacao/login",
    USER_SYSTEMS: "/api-autenticacao/sistemas/usuario",
    GRADES: "/NovaSecretaria/NotasFaltasMediaFinal/NotasFaltasMediaFinal",
    EXAMS: "/NovaSecretaria/MediasExamesFinais/MediasExamesFinais",
    ACADEMIC_RECORDS: "/NovaSecretaria/IntegralizacaoCurricular/IntegralizacaoCurricular",
    PAYMENTS: "/NovaSecretaria/PosicaoFinanceira/PosicaoFinanceira",
    BANKS_SLIPS: "/NovaSecretaria/BoletoPagamentoOnline/BoletoPagamentoOnline",
    BANKS_SLIP: "/OpcaoDataPgto.aspx?Param=",
    USER_REGISTER: "/NovaSecretaria/CadastroSecretariaOnline/CadastroSecretariaOnline",
}

const DEFAULT_CONFIG = {
    baseURL: ORIGINS.SEC_2,
    maxRedirects: 0,
    validateStatus: false,
    setBaseURL: function(baseURL) {
        this.baseURL = baseURL;
    },
    setCookie: function(cookie) {
        this.headers["Cookie"] = cookie;
    }
}

async function fetch(path, method, headers, params, data, responseType) { 
    path = validatePath(path);

    DEFAULT_CONFIG["url"] = path;
    DEFAULT_CONFIG["method"] = method;
    DEFAULT_CONFIG["headers"] = headers;
    DEFAULT_CONFIG["data"] = data;
    DEFAULT_CONFIG["params"] = params;
    DEFAULT_CONFIG["responseType"] = responseType;

    let response = await HttpClient.request(DEFAULT_CONFIG);
    logRequest("fetch", response);
    return response;
}

async function fetchLogin(payload) {
    DEFAULT_CONFIG.setBaseURL(ORIGINS.SYSTEMS);
    let response = await HttpClient.post(PATHS.LOGIN, payload, DEFAULT_CONFIG)
    logRequest("fetchLogin", response);
    return response;
}

async function fetchNF(cookie) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.GRADES, DEFAULT_CONFIG)
    logRequest("fetchNF", response);
    return response;
}

async function fetchME(cookie) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.EXAMS, DEFAULT_CONFIG);
    logRequest("fetchME", response);
    return response;
}

async function fetchAcademicRecords(cookie) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.ACADEMIC_RECORDS, DEFAULT_CONFIG);
    logRequest("fetchAdademicRecords", response);
    return response;
}

async function fetchPayments(cookie) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.PAYMENTS, DEFAULT_CONFIG);
    logRequest("fetchPayments", response);
    return response;
}

async function fetchBankSlips(cookie) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.BANKS_SLIPS, DEFAULT_CONFIG);
    logRequest("fetchBankSlips", response);
    return response;
}

async function fetchBankSlip(cookie, bankSlipId) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.BANKS_SLIP + bankSlipId, DEFAULT_CONFIG);
    logRequest("fetchBankSlip", response);
    return response;
}

async function fetchUserRegister(cookie) {
    DEFAULT_CONFIG.setCookie(cookie);
    let response = await HttpClient.get(PATHS.USER_REGISTER, DEFAULT_CONFIG);
    logRequest("fetchUserRegister", response);
    return response;
}

async function fetchUserSystems(authorization) {
    DEFAULT_CONFIG.setBaseURL(ORIGINS.SYSTEMS);
    DEFAULT_CONFIG["headers"] = { 
        "Authorization": authorization
    }
    let response = await HttpClient.get(PATHS.USER_SYSTEMS, DEFAULT_CONFIG);
    logRequest("fetchUserSystems", response);
    return response;
}

function validatePath(path) {
    if (path.includes("https")) {
        let url = new URL(path); 
        DEFAULT_CONFIG["baseURL"] = url.origin;
        path = url.pathname;
        if (url.search !== undefined) {
            path += url.search
        } 
    } 
    return path;
}

function logRequest(thread, response) {
    if (!IS_REQUEST_LOGGING_ENABLED) { return; }

    let url = response.config.baseURL + response.config.url;
    let method = response.config.method;
    let headers = response.config.headers;

    let status = response.status;
    let contentType = "" + response.headers["content-type"];
    let data = response.data;

    console.log("====== " + thread + " ======");
    console.log("");
    console.log("REQUEST");
    console.log("");
    console.log("URL: " + method + " - " + url); 
    console.log("HEADERS: " + JSON.stringify(headers, false, 4));
    console.log("");
    console.log("RESPONSE");
    console.log("");
    console.log("STATUS: " + status);
    console.log("HEADERS: " + JSON.stringify(response.headers, false, 4));
    if (contentType.includes("application/json")) {
        console.log("DATA: " + JSON.stringify(data, false, 4))
    } else {
        console.log("DATA: " + contentType)
    }
    console.log("");
}

module.exports = {
    fetch,
    fetchLogin,
    fetchNF,
    fetchME,
    fetchAcademicRecords,
    fetchPayments,
    fetchBankSlips,
    fetchBankSlip,
    fetchUserRegister,
    fetchUserSystems
} 