
const authenticationRouters     = require("./authentication-routers");
const disciplinesRouters        = require("./disciplines-routers");
const academicRecordsRouters    = require("./academic-records-routers");
const financeRouters            = require("./finance-routers");
const userRouters               = require("./user-routers");
const testsRouters              = require("./tests-routers");


module.exports = {
    authenticationRouters,
    disciplinesRouters,
    academicRecordsRouters,
    financeRouters,
    userRouters,
    testsRouters
}