const functions                 = require("firebase-functions");
const app                       = require("express")();
const routers                   = require("./routers")
const region                    = "southamerica-east1"; 

// Routers  
app.use(routers.authenticationRouters); 
app.use(routers.disciplinesRouters);
app.use(routers.financeRouters);
app.use(routers.academicRecordsRouters);
app.use(routers.userRouters);
app.use(routers.testsRouters);

// Criate API Function

exports.api = functions.region(region).https.onRequest(app);
