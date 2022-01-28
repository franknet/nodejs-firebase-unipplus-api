const { Router } = require("express");
const { fetch } = require("../src/controllers/academic-records-controller");
const router = Router();

router.get("/v1/academic_records", fetch);

module.exports = router