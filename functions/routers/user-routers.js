const { Router } = require("express");
const { fetchPhoto } = require("../src/controllers/user-controller");
const router = Router();

router.get("/v1/user/photo", fetchPhoto);

module.exports = router