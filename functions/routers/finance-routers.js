const { Router } = require("express");
const { fetchPayments, fetchBankSlip } = require("../src/controllers/finance-controller");
const router = Router();

router.get("/v1/finance/payments", fetchPayments);
router.get("/v1/finance/bank_slip", fetchBankSlip);

module.exports = router