const express = require("express");
const router = express.Router({mergeParams: true});
const usersController = require("../controllers/users");

//get all user sightings
router.get("/:userId/sightings", usersController.getSightings);

module.exports = router;