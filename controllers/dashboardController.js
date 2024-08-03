const Demo = require('../models/demoModel');
//const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsync = require('../middlewares/catchAsync');

exports.dashboard = catchAsync(async (req, res, next) => {
  const demosCount = await Demo.countDocuments();
  const userCount = await User.countDocuments();

  res.status(200).json({
    demos: demosCount,
    users: userCount,
  });
});

exports.getDemoMode = catchAsync(async (req, res, next) => {
  res.status(200).json({
    demo: global.demo,
  });
});
