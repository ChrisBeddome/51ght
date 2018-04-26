const express = require("express");
const router = express.Router();
const sightingsController = require("../controllers/sightings");
const authorize = require("../middleware/authorize");
const authenticate = require("../middleware/authenticate");

//all sightings
router.get("/", sightingsController.getAllSightings);
router.post("/", authenticate, sightingsController.addNewSighting);

//single sighting 
router.get("/:sightingId", sightingsController.getSingleSighting);
router.patch("/:sightingId", authenticate, authorize.sightingAuthor, sightingsController.updateSighting);
router.delete("/:sightingId", authenticate, authorize.sightingAuthor, sightingsController.deleteSighting);

module.exports = router;