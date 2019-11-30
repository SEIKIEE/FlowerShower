var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/userController');
var teacherControllers = require('../controllers/teacherController');

/* GET users listing. */
router.get('/', userControllers.userIndex);
router.get('/settings', userControllers.userSettings);
router.post('/uploadImage', userControllers.userChangeImage);
router.post('/updateUserInfo', userControllers.updateUserInfo);
router.post('/updateUserPwd', userControllers.updateUserPwd);
router.post('/updateTeacherPage', teacherControllers.updateTeacherPage);

module.exports = router;
