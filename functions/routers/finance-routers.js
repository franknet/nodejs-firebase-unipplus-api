const { Router } = require("express");
const controller = require("../src/controllers/finance-controller");
const router = Router();

router.get("/v1/finance/payments", controller.fetchPayments);
router.get("/v1/finance/bank_slip", controller.fetchBankSlip);

module.exports = router