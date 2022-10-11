const { Router } = require("express");
const controller = require("../src/controllers/disciplines-controller");
const controllerEAD = require("../src/controllers/ead/disciplines-controller");
const router = Router();

router.get("/v1/disciplines", controller.fetchDisciplines);
router.get("/v1/ead/disciplines", controllerEAD.fetchDisciplines);

module.exports = router;