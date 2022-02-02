
const { Router } = require("express");
const controller = require("../src/controllers/authentication-controller");
const router = Router();

router.post("/v1/authentication", controller.fetchAuthentication);

module.exports = router;