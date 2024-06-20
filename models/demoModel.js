const mongoose = require('mongoose');

/*

[
  {
    "id": 1,
    "title": "Css generator",
    "title2": "React Css generator",
    "long_desc": "Questa è una demo ",
    "tecnology": "React",
    "slug": "react-css-generator",
    "bg": "cssgenerator",
    "order": 2,
    "frontend": "https://css-generator.davidebalice.dev/",
    "github": "https://github.com/davidebalice/react-css-generator"
  },
  {
    "id": 2,
    "title": "Creative agency",
    "title2": "Creative agency Laravel Demo",
    "long_desc": "Questa è una demo ",
    "tecnology": "Laravel",
    "slug": "laravel-creative-agency-web-site-demo",
    "bg": "creative",
    "order": 6,
    "frontend": "https://creative-agency.davidebalice.dev/",
    "backend": "https://creative-agency.davidebalice.dev/login",
    "github": "https://github.com/davidebalice/laravel-creative-agency"
  },
  {
    "id": 3,
    "title": "Realestate Laravel",
    "title2": "Demo 3",
    "long_desc": "Questa è una demo ",
    "tecnology": "Laravel",
    "slug": "laravel-realestate-web-site",
    "bg": "realestate",
    "order": 3,
    "frontend": "aaa",
    "backend": "bbb",
    "github": "ccc",
    "gallery_frontend": [
      "https://www.aroundweb.it/davidebalice.dev/gallery/realestate1.jpg",
      "https://www.aroundweb.it/davidebalice.dev/gallery/realestate2.jpg",
      "https://www.aroundweb.it/davidebalice.dev/gallery/realestate3.jpg"
    ],
    "gallery_backend": [
      "https://www.aroundweb.it/davidebalice.dev/gallery/realestate1_backend.jpg",
      "https://www.aroundweb.it/davidebalice.dev/gallery/realestate2_backend.jpg",
      "https://www.aroundweb.it/davidebalice.dev/gallery/realestate3_backend.jpg"
    ]
  },
  {


*/

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
      maxlength: ['100', 'max 100 characters'],
      minlength: ['4', 'min 4 characters'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Project must have a summary'],
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
/*
projectSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'project_id',
  localField: '_id',
});

projectSchema.pre('find', function (next) {
  this.populate('members.user');
  next();
});

projectSchema.pre('find', function (next) {
  this.populate('members', 'name surname email role photo');
  next();
});

projectSchema.pre('findOne', function (next) {
  this.populate('members', 'name surname email role photo');
  next();
});

projectSchema.pre('find', function (next) {
  this.populate('client', 'companyName email');
  next();
});

projectSchema.post('save', (doc, next) => {
  next();
});
*/
const Demo = mongoose.model('Demo', demoSchema);

module.exports = Demo;
