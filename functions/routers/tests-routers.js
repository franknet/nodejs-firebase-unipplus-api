const { Router } = require("express");
const { testPost200, testGet200, testGet302, testDownloadPDF } = require("../src/controllers/test-controller");
const router = Router();

router.get("/v1/test_post_sucess", testPost200);
router.get("/v1/test_get_success", testGet200);
router.get("/v1/test_service_error", testGet302);
router.get("/v1/test_download_pdf", testDownloadPDF);

module.exports = router