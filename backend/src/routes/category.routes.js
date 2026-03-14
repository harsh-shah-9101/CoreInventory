const router = require('express').Router();
const categoryController = require('../controllers/category.controller');

router.get('/',  categoryController.getCategories);
router.post('/', categoryController.createCategory);

module.exports = router;
