const express = require('express');
const router = express.Router();
const verifyToken = require('../utilities/verify-token');

const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.post('/addCategory', verifyToken, categoryController.addCategory);
router.post('/addSubCategory', verifyToken, categoryController.addSubCategory);

module.exports = router;