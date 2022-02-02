const { Router } = require("express");
const controller = require("../src/controllers/academic-records-controller");
const router = Router();

router.get("/v1/academic_records", controller.fetch);

module.exports = router;