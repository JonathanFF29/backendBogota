const express = require('express');
const router = express.Router();
const verifyToken = require('../utilities/verify-token');

const model3DController = require('../controllers/model3dController');

router.get('/getSavedModels', verifyToken, model3DController.getSavedModels);
router.post('/saveFavorite',verifyToken, model3DController.saveFavorite);
router.get('/getLikedModels', verifyToken, model3DController.getLikedModels);
router.post('/saveLike',verifyToken, model3DController.saveLike);
router.get('/getCompanies', model3DController.getCompanies);
router.get('/getFormats', model3DController.getFormats);
router.get('/getTags', model3DController.getTags);
router.post('/getModelsBySubcategoryId', model3DController.getModelsBySubcategoryId);
router.post('/getModelInfo', model3DController.getModelInfo);
router.get('/getModelTags', verifyToken, model3DController.getModelTags);
router.get('/getModelFormats', verifyToken, model3DController.getModelFormats);
router.post('/addModel', verifyToken, model3DController.addModel);
router.get('/list', verifyToken, model3DController.list);
router.post('/getModelById', verifyToken, model3DController.getModelById);
router.post('/updateModel', verifyToken, model3DController.updateModel);
router.get('/getFavoriteModels', verifyToken, model3DController.getFavoriteModels);

module.exports = router;