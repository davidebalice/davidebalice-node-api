const express = require('express');
const galleryController = require('../controllers/galleryController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demo_mode');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/gallerys');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.use(authController.protect);

router
  .route('/gallery/:id')
  .get(authController.protect, galleryController.getGallery);

router
  .route('/add/gallery/')
  .post(demoMode, authController.protect, upload.any(), galleryController.createGallery);

router
  .route('/delete/gallery/')
  .post(demoMode, authController.protect, galleryController.deleteGallery);

router
  .route('/update/gallery/')
  .post(authController.protect, galleryController.updateGallery);

router
  .route('/gallery/:filename')
  .get(authController.protect, galleryController.download);

router
  .route('/gallery/img/:filename')
  .get(authController.protect, galleryController.galleryImg);

module.exports = router;
