const { Router } = require("express");
const controller = require("../src/controllers/finance-controller");
const controllerEAD = require("../src/controllers/finance-controller");
const router = Router();

router.get("/v1/finance/payments", controller.fetchPayments);
router.get("/v1/finance/bank_slip", controller.fetchBankSlip);
router.get("/v1/ead/finance/payments", controllerEAD.fetchPayments);
router.get("/v1/ead/finance/bank_slip", controllerEAD.fetchBankSlip);

module.exports = router;