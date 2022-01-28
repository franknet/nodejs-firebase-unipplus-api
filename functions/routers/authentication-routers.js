
const { Router } = require("express");
const { fetchAuthentication } = require("../src/controllers/authentication-controller");
const router = Router();

router.post("/v1/authentication", fetchAuthentication);

module.exports = router