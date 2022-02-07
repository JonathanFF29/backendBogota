const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../utilities/verify-token');

const userController = require('../controllers/userController');
const { use } = require('./categoryRoute');
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        switch (file.fieldname) {
            case 'profileImg':
                cb(null, path.join(__dirname, '../public/uploads/profilePictures'));
                break;
            case 'tagImg':
                cb(null, path.join(__dirname, '../public/uploads/tagsPictures'));
                break;
        }
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

router.get('/', userController.message);
router.get('/getUserInfo', verifyToken, userController.getUserInfo);
router.post('/updateUserInfo', verifyToken, userController.updateUserInfo);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/confirm/:token', userController.confirm);
router.post('/resendConfirmationEmail', userController.resendConfirmationEmail);
router.post('/passwordRecovery', userController.passwordRecovery);
router.post('/verifyUserSN', userController.verifyUserSN);
router.post('/verifyUserActive', userController.verifyUserActive);

router.post('/addUserTags', verifyToken, userController.addUserTags);
router.get('/getTags', verifyToken, userController.getTags);
router.get('/getUserTags', verifyToken, userController.getUserTags);

router.post('/updateUser', verifyToken, userController.updateUser);
router.post('/getUser', verifyToken, userController.getUser);
router.get('/list', verifyToken, userController.list);
router.get('/getUserRoles', verifyToken, userController.getUserRoles);
router.post('/addUserRole', userController.addUserRole);
router.post('/createTag', upload.single('tagImg'), userController.createTag);
router.get('/getCompanyUsers',verifyToken, userController.getCompanyUsers);

module.exports = router;