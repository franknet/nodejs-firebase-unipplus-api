const { Router } = require("express");
const controller = require("../src/controllers/disciplines-controller");
const router = Router();

router.get("/v1/disciplines", controller.fetchDisciplines);

module.exports = router