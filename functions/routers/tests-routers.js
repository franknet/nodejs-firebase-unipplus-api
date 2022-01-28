const { Router } = require("express");
const { testPost200, testGet200, testGet302, testDownloadPDF } = require("../src/controllers/test-controller");
const router = Router();

router.get("/v1/test-post-sucess", testPost200);
router.get("/v1/test-get-success", testGet200);
router.get("/v1/test-service-error", testGet302);
router.get("/v1/test-download-pdf", testDownloadPDF);

module.exports = router