const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demo_mode');
const User = require('../models/userModel');

router.route('/').get(authController.protect, async function (req, res) {
  const users = await User.find().limit(6);
  res.render('Dashboard/index', { users: users });
});

router.route('/demos').get(authController.protect, demoController.getDemos);

router
  .route('/add/demo')
  .get(authController.protect, demoController.addDemo)
  .post(demoMode, authController.protect, demoController.createDemo);

router.route('/demo/:id').get(demoMode, authController.protect, demoController.getDemo);

router
  .route('/edit/demo/:id')
  .get(demoMode, authController.protect, demoController.editDemo)
  .post(demoMode, authController.protect, demoController.updateDemo);

router.route('/demo/members/:id').get(demoMode, authController.protect, demoController.membersDemo);

router.route('/add/member/demo/').post(demoMode, authController.protect, demoController.AddMemberDemo);

router.route('/remove/member/demo/').post(demoMode, authController.protect, demoController.RemoveMemberDemo);

router
  .route('/demo/photo/:id')
  .post(
    demoMode,
    authController.protect,
    demoController.uploadImage,
    demoController.resizeImage,
    demoController.updatePhoto
  );

router
  .route('/demo/gallery/:id')
  .post(
    demoMode,
    authController.protect,
    demoController.uploadGallery,
    demoController.resizeGallery,
    demoController.updateGallery
  );

router
  .route('/demo/delete/:id')
  .post(demoMode, authController.protect, demoController.deleteDemo);

router
  .route('/gallery/delete')
  .post(demoMode, authController.protect, demoController.deleteGallery);

router
  .route('/active/demo/:id')
  .post(demoMode, authController.protect, demoController.activeDemo);

router
  .route('/demo/cover/:filename')
  .get(demoController.cover);

module.exports = router;
