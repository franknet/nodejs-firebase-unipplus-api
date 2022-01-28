const { Router } = require("express");
const { fetchDisciplines } = require("../src/controllers/disciplines-controller");
const router = Router();

router.get("/v1/disciplines", fetchDisciplines);

module.exports = router