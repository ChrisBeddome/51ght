const express = require("express");
const router = express.Router({mergeParams: true});
const imagesController = require("../controllers/images");
const authorize = require("../middleware/authorize");
const authenticate = require("../middleware/authenticate");

//image routes
router.post("/", imagesController.uploadImage.single("image"), authenticate, authorize.sightingAuthor, imagesController.addImage);
router.patch("/", imagesController.uploadImage.single("image"), authenticate, authorize.sightingAuthor, imagesController.addImage);
router.delete("/", imagesController.extractParams.single(), authenticate, authorize.sightingAuthor, imagesController.deleteImage);

module.exports = router;