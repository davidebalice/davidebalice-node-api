const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Demo must have a title'],
      trim: true,
      maxlength: ['100', 'max 100 characters'],
      minlength: ['4', 'min 4 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Demo must have a description'],
    },
    tecnology: {
      type: String,
      trim: true,
      required: [true, 'Demo must have a tecnology'],
    },
    slug: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
    },
    frontend: {
      type: String,
      trim: true,
    },
    backend: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    githubBackend: {
      type: String,
      trim: true,
    },
    gallery_frontend: [String],
    gallery_backend: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    lastUpdate: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    fullstack: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Demo = mongoose.model('Demo', demoSchema);

module.exports = Demo;
