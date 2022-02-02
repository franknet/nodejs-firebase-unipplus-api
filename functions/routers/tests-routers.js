const { Router } = require("express");
const controller = require("../src/controllers/test-controller");
const router = Router();

router.get("/v1/test_post_sucess", controller.testPost200);
router.get("/v1/test_get_success", controller.testGet200);
router.get("/v1/test_service_error", controller.testGet302);
router.get("/v1/test_download_pdf", controller.testDownloadPDF);

module.exports = router;