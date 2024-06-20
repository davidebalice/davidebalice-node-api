const mongoose = require('mongoose');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const moment = require('moment');
const sharp = require('sharp');
const Task = require('../models/taskModel');
const Gallery = require('../models/galleryModel');
const Demo = require('../models/demoModel');
const factory = require('./handlerFactory');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const ApiQuery = require('../middlewares/apiquery');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');

exports.getGallery = catchAsync(async (req, res, next) => {
  try {
    let filterData = { task_id: req.params.id };
    if (req.query.key) {
      const regex = new RegExp(req.query.key, 'i');
      filterData = { demo_id: req.params.id, name: { $regex: regex } };
    }
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const gallerys = await Gallery.find(filterData).sort('-createdAt').skip(skip).limit(limit);
    const task = await Task.findOne({ _id: req.params.id }).populate('demo_id');

    const formattedGallery = gallerys.map((gallery) => {
      const formattedDate = moment(gallery.createdAt).format('DD/MM/YYYY');
      const formattedDeadline = moment(gallery.deadline).format('DD/MM/YYYY');
      return { ...gallery._doc, formattedDate, formattedDeadline };
    });

    const count = await Gallery.countDocuments();
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      title: 'Gallery',
      gallerys: formattedGallery,
      task,
    });
  } catch (err) {
    res.status(200).json({
      message: err.message,
    });
  }
});

async function getGallerysData(res, taskId, title, status) {
  try {
    let filterData = { task_id: taskId };
    const gallerys = await Gallery.find(filterData).sort('-createdAt');
    res.status(200).json({
      title: title,
      status: status,
      gallerys,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

exports.createGallery = catchAsync(async (req, res, next) => {
  try {
    req.body._id = new mongoose.Types.ObjectId();
    req.body.owner = res.locals.user._id;

    const galleryNames = req.files.map((file) => file.originalname);

    for (const file of req.files) {
      const tempPath = file.path;
      const destinationPath = path.join('./uploads/gallerys', file.filename);
      fs.renameSync(tempPath, destinationPath);
    }

    for (const fileName of req.files) {
      const tempPath = fileName.path;

      const gallery = await Gallery.create({
        name: req.body.name,
        file: fileName.filename,
        owner: req.body.owner,
        task_id: req.body.task_id,
        demo_id: req.body.demo_id,
        owner: res.locals.user._id,
      });
    }

    await getGallerysData(res, req.body.task_id, 'Gallery created', 'success');
  } catch (err) {
    console.log(err);
    await getGallerysData(res, req.body.task_id, 'Gallery error', 'error');
  }
});

exports.deleteGallery = catchAsync(async (req, res, next) => {
  const doc = await Gallery.findByIdAndDelete(req.body.id);

  try {
    fs.unlinkSync(`./uploads/gallery/${doc.file}`);
  } catch (err) {
    console.error('Error:', err);
  }

  await getGallerysData(res, req.body.task_id, 'Gallery deleted', 'success');
  if (!doc) {
    await getGallerysData(res, req.body.task_id, 'Gallery error', 'error');
  }
});

exports.updateGallery = catchAsync(async (req, res, next) => {
  try {
    const galleryId = req.body.id;
    const name = req.body.name;

    console.log(galleryId);
    console.log(name);

    const gallery = await Gallery.findOne({ _id: galleryId });

    if (!gallery) {
      return res.status(404).json({
        message: 'Gallery not found',
      });
    }

    gallery.name = name;
    try {
      await gallery.save();
    } catch (error) {
      console.error('Error:', error);
    }

    await getGallerysData(res, gallery.task_id, 'Gallery created', 'success');
  } catch (err) {
    await getGallerysData(res, gallery.task_id, 'Gallery error', 'error');
  }
});

exports.download = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, 'uploads/gallerys', filename);

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error download file.' });
    }
  });
});

exports.resizeImage = catchAsync(async (req, res, next) => {
  console.log(req.files.imageCover);
  if (!req.files.imageCover) return next();

  req.body.imageCover = `demo-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/demos/${req.body.imageCover}`);

  next();
});

exports.resizeGallery = catchAsync(async (req, res, next) => {
  if (!req.files.images) return next();
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `demo-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/demos/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

exports.galleryImg = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, 'uploads/gallerys', filename);
  res.sendFile(filePath);
});
