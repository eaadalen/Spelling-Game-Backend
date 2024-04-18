const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const Projects = Models.Project;
const Users = Models.User;
const app = express();
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'http://localhost:4200', 'https://nv5-database.netlify.app', 'https://eaadalen.github.io'];
const port = process.env.PORT || 8080;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(morgan('common'));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Greeting message
app.get('/', (req, res) => {
  res.send("Hello");
});

// Gets the full list of projects
app.get('/projects', passport.authenticate('jwt', { session: false }), (req, res) => {
  Projects.find()
      .then((projects) => {
        res.status(201).json(projects);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// Get full list of users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// Create a new user
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Password', 'Password is required').not().isEmpty(),
  ], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Add a project to the database
app.post('/input-project',
  [
    check('Title', 'Title is required').not().isEmpty(),
    check('ProjectNumber', 'Project Number is required').not().isEmpty(),
    check('Description', 'Description is required').not().isEmpty(),
    check('Keywords', 'Keywords are required').not().isEmpty(),
    check('FileLocation', 'File Location is required').not().isEmpty(),
    check('ProjectManager', 'Project Manager is required').not().isEmpty(),
    check('ProjectStaff', 'Project Staff is required').not().isEmpty(),
    check('Systems_and_Equipment', 'Systems and Equipment are required').not().isEmpty()
  ], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    await Projects.findOne({ ProjectNumber: req.body.ProjectNumber }) // Search to see if a project with the requested project number already exists
      .then((project) => {
        if (project) {
          //If the project number is found, send a response that it already exists
          return res.status(400).send(req.body.ProjectNumber + ' already exists');
        } else {
          Projects
            .create({
              Title: req.body.Title,
              ProjectNumber: req.body.ProjectNumber,
              Description: req.body.Description,
              Keywords: req.body.Keywords,
              FileLocation: req.body.FileLocation,
              ProjectManager: req.body.ProjectManager,
              ProjectStaff: req.body.ProjectStaff,
              Systems_and_Equipment: req.body.Systems_and_Equipment,
            })
            .then((project) => { res.status(201).json(project) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
 });