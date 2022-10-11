const { Router } = require("express");
const controller = require("../src/controllers/academic-records-controller");
const controllerEAD = require("../src/controllers/ead/academic-records-controller");
const router = Router();

router.get("/v1/academic_records", controller.fetch);
router.get("/v1/ead/academic_records", controllerEAD.fetch);

module.exports = router;