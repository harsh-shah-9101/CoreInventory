const router = require('express').Router();
const locationController = require('../controllers/location.controller');

router.get('/', locationController.getLocations);
router.post('/', locationController.createLocation);

module.exports = router;
