const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const sightingRoutes = require("./api/routes/sightings");
const commentRouter = require("./api/routes/comments");
const imageRouter = require("./api/routes/images");
const userRouter = require("./api/routes/users");
const config = require("./config/config");
var firebase = require('firebase-admin');
var serviceAccount = require('./config/firebaseServiceAccountKey.json');

//mongoose connect
const mongoose = require("mongoose");
mongoose.connect(config.connectionString);
const db = mongoose.connection;

//firebase connect
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: config.firebaseConnection
});

//artificial delay
// REMOVE FOR PRODUCTION
// app.use((req, res, next) => {
//   setTimeout(() => next(), 350);
// });

//logging
app.use(morgan("dev"));

//parsing
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//handle CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

//index route
app.use('/', express.static(__dirname + "/client"));
// app.use('/', express.static(__dirname + "/client", {maxAge: 86400000})); // enable caching

//favicon route
app.use('/favicon.ico', express.static(__dirname + '/client/images/favicon.ico'));

//image route
app.use('/images', express.static(__dirname + "/data/images"));

//api routes
app.use("/api/sightings", sightingRoutes);
app.use("/api/sightings/:sightingId/comments", commentRouter);
app.use("/api/sightings/:sightingId/image", imageRouter);
app.use("/api/users", userRouter);

//error handling
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.log(error);
  res.status(error.status || 500).json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;