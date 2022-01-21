const functions             = require("firebase-functions");
const app                   = require("express")();
const region                = "southamerica-east1";  

// Controllers

const authentication        = require("./src/controllers/authentication-controller"); 
const user                  = require("./src/controllers/user-controller");
const disciplines           = require("./src/controllers/disciplines-controller");
const finance               = require("./src/controllers/finance-controller");
const academic_records      = require("./src/controllers/academic-records");

// Routers 

app.post("/v1/authentication", authentication.fetch);

app.get("/v1/disciplines", disciplines.fetch);

app.get("/v1/finance/payments", finance.fetchPayments);

app.get("/v1/finance/bank_slip", finance.fetchBankSlip);

app.get("/v1/academic_records", academic_records.fetch);

app.get("/v1/user/photo", user.fetchPhoto);

// Criate API Function

exports.api = functions.region(region).https.onRequest(app);
