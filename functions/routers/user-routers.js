const { Router } = require("express");
const controller = require("../src/controllers/user-controller");
const router = Router();

router.get("/v1/user/photo", controller.fetchPhoto);

module.exports = router;