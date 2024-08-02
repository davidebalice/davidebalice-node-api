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

router.route('/demos').get(demoController.getDemos);
router.route('/tecnologies').get(authController.protect, demoController.getTecnologies);

router
  .route('/add/demo')
  .get(authController.protect, demoController.addDemo)
  .post(authController.protect, demoMode, demoController.createDemo);

router.route('/demo/:slug').get(demoController.getDemo);

router
  .route('/edit/demo/:id')
  .get(demoController.editDemo)
  .post(authController.protect, demoMode, demoController.updateDemo);

router
  .route('/demo/photo/:id')
  .post(
    authController.protect,
    demoMode,
    demoController.uploadImage,
    demoController.resizeImage,
    demoController.updatePhoto
  );

router
  .route('/demo/gallery/:id')
  .post(
    authController.protect,
    demoMode,
    demoController.uploadGallery,
    demoController.resizeGallery,
    demoController.updateGallery
  );

router.route('/demo/delete/:id').post(authController.protect, demoMode, demoController.deleteDemo);

router.route('/delete/gallery/').post(authController.protect, demoMode, demoController.deleteGallery);

router.route('/active/demo/:id').post(authController.protect, demoMode, demoController.activeDemo);

router.route('/demo/cover/:filename').get(demoController.cover);

router.route('/demo/gallery/:filename').get(demoController.gallery);

module.exports = router;
