const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Insert title of gallery'],
    },
    file: {
      type: String,
      required: [true, 'Insert gallery file'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    demo_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Demo',
      required: [true, 'Gallery must belong to a demo'],
    },
    task_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Task',
      required: [true, 'Gallery must belong to a task'],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

gallerySchema.index({ owner: 1 });
gallerySchema.index({ task_id: 1 });

gallerySchema.pre('find', function (next) {
  this.populate('owner', 'name surname photo email role');
  next();
});

gallerySchema.pre('findOne', function (next) {
  this.populate('owner', 'name surname photo email role');
  next();
});

gallerySchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne();
  next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
