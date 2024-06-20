const multer = require('multer');
const multerStorage = multer.memoryStorage();
const moment = require('moment');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Demo = require('../models/demoModel');
const Task = require('../models/taskModel');
const Activity = require('../models/activityModel');
const User = require('../models/userModel');
const ApiQuery = require('../middlewares/apiquery');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const { parseISO, format, startOfMonth, endOfMonth } = require('date-fns');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImage = upload.single('imageCover');
exports.uploadGallery = upload.fields([{ name: 'images', maxCount: 6 }]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.body.filename = `demo-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${process.env.FILE_PATH}/uploads/demo/${req.body.filename}`);
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
        .toFile(`public/img/demo/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

exports.getDemos = catchAsync(async (req, res, next) => {
  const userId = res.locals.user._id;
  const userRole = res.locals.user.role;

  let filterData = {};

  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData.name = { $regex: regex };
  }
  /*
  if (userRole === 'admin') {
    filterData.$or = [{ owner: userId }];
  } else {
    filterData.$or = [{ owner: userId }, { 'members.user': userId }];
  }
*/
  const setLimit = 12;
  const limit = req.query.limit * 1 || setLimit;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  const demos = await Demo.aggregate(
    [
      {
        $match: filterData,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },

      /*
      {
        $unwind: {
          path: '$latestActivity',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          numTasks: { $size: '$tasks' },
          numMembers: { $size: '$members' },
        },
      },

      {
        $demo: {
          _id: 1,
          name: 1,
          createdAt: 1,
          imageCover: 1,
          
          lastUpdate: { $ifNull: ['$latestActivity.lastUpdate', new Date(0)] },
        },
      },
      */
    ],
    {
      debug: true,
    }
  );

  const count = await Demo.countDocuments();
  const totalPages = Math.ceil(count / limit);

  const formattedDemos = demos.map((demo) => {
    const lastUpdate = format(new Date(demo.lastUpdate), 'dd/MM/yyyy HH:mm');
    const formattedDate = format(new Date(demo.createdAt), 'dd/MM/yyyy');
    return { ...demo, formattedDate, lastUpdate };
  });

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Demo added';
    } else if (req.query.m === '2') {
      message = 'Demo deleted';
    }
  }

  res.status(200).json({
    demos: formattedDemos,
    currentPage: page,
    page,
    limit,
    totalPages,
    message,
  });
});

exports.addDemo = catchAsync(async (req, res, next) => {
  const clients = await Client.find({}).sort({ companyName: 1 });
  res.status(200).json({
    title: 'Add demo',
    owner: res.locals.user._id,
    clients: clients.map((client) => ({
      _id: client._id,
      companyName: client.companyName,
    })),
  });
});

exports.createDemo = catchAsync(async (req, res, next) => {
  try {
    req.body._id = new mongoose.Types.ObjectId();
    req.body.owner = res.locals.user._id;
    await Demo.create(req.body);

    res.status(200).json({
      title: 'Create demo',
      create: 'success',
    });
  } catch (err) {
    res.status(200).json({
      title: 'Create demo',
      formData: req.body,
      message: err.message,
    });
  }
});

exports.deleteDemo = catchAsync(async (req, res, next) => {
  const doc = await Demo.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    title: 'Delete demo',
    create: 'success',
  });
});

exports.getDemo = catchAsync(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id)
    .populate('owner', 'name surname photo')
    .populate('client', 'companyName');

  const activity = await Activity.findOne({ demo_id: demo.id }).sort('-lastUpdate');

  if (activity) {
    const formattedLastUpdate = moment(activity.lastUpdate).format('DD/MM/YYYY HH:mm');
    demo.lastUpdate = formattedLastUpdate;
  }

  if (!demo) {
    return next(new AppError('No document found with that ID', 404));
  }

  const tasks = await Task.find({ demo_id: req.params.id }).sort({ createdAt: 1 });

  //console.log(tasks);

  console.log(demo);

  res.status(200).json({
    title: 'Demo',
    demo,
    tasks,
  });
});

exports.editDemo = catchAsync(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id);
  if (!demo) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    title: 'Edit demo',
    demo,
  });
});

exports.updateDemo = catchAsync(async (req, res, next) => {
  if (global.demo) {
    res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  } else {
    const doc = await Demo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      title: 'Update demo',
      status: 'success',
    });
  }
});

exports.membersDemo = catchAsync(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id);

  if (!demo) {
    return next(new AppError('No document found with that ID', 404));
  }

  const allUsers = await User.find().sort({ surname: 1 });
  const memberUserIds = demo.members.map((member) => member._id.toString());
  const filteredUsers = allUsers.filter((user) => !memberUserIds.includes(user._id.toString()));

  res.status(200).json({
    title: 'Demo members',
    demo,
    users: filteredUsers,
  });
});

exports.AddMemberDemo = catchAsync(async (req, res, next) => {
  const demo = await Demo.findById(req.body.demo_id);
  const member = await User.findById(req.body.member_id);

  if (!demo || !member) {
    return next(new AppError('No document found with that ID', 404));
  }

  const memberIds = demo.members.map((member) => member._id.toString());
  if (!memberIds.includes(member._id)) {
    demo.members.push(member);
    await demo.save();
  }

  const allUsers = await User.find().sort({ surname: 1 });
  const memberUserIds = demo.members.map((member) => member._id.toString());
  const filteredUsers = allUsers.filter((user) => !memberUserIds.includes(user._id.toString()));

  res.status(200).json({
    title: 'Demo members',
    demo,
    members: demo.members,
    users: filteredUsers,
  });
});

exports.photoDemo = catchAsync(async (req, res, next) => {
  let query = await Demo.findById(req.params.id);
  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  let message = '';
  res.render('Demos/photo', {
    status: 200,
    title: 'Photo demo',
    formData: doc,
    message: message,
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  const doc = await Demo.findByIdAndUpdate(req.params.id, req.body);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  //res.redirect('/demo/photo/' + doc._id);
  res.status(200).json({
    title: 'Update photo',
    create: 'success',
  });
});

exports.updateGallery = catchAsync(async (req, res, next) => {
  const doc = await Demo.updateOne({ _id: req.params.id }, { $push: { images: { $each: req.body.images } } });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  //res.redirect('/demo/photo/' + req.params.id);
  res.status(200).json({
    title: 'Update gallery',
    create: 'success',
  });
});

exports.deleteGallery = catchAsync(async (req, res, next) => {
  let query = await Demo.findById(req.body.id);
  const image = req.body.image;
  if (!image) {
    return next(new AppError('No document found with that ID', 404));
  }

  const index = query.images.indexOf(image);
  if (index > -1) {
    query.images.splice(index, 1);
  }

  const doc = await Demo.updateOne({ _id: req.body.id }, { $set: { images: query.images } });

  let pathFile = path.join(__dirname, '/public/img/demos', image);
  pathFile = pathFile.replace('controllers', '');

  if (fs.existsSync(pathFile)) {
    fs.unlinkSync(pathFile);
    console.log('File deleted:', image);
  } else {
    console.log('File not exists:', image);
  }

  //res.redirect('/demo/photo/' + req.body.id);
  res.status(200).json({
    title: 'Delete photo',
    create: 'success',
  });
});

exports.activeDemo = catchAsync(async (req, res, next) => {
  const doc = await Demo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.imageCover = req.body.filename;
  }

  const doc = await Demo.findByIdAndUpdate(req.params.id, req.body);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    title: 'Photo demo',
    status: 'success',
    imageCover: req.body.imageCover,
  });
});

exports.cover = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, 'uploads/demo', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
  });
});