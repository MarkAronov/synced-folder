const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const chokidar = require('chokidar');
const { router } = require('./routes/index');

// const watcher = chokidar.watch('C:\\Users\\asda\\Downloads\\DayHard', {
//   ignored: /^\./,
//   persistent: true,
//   awaitWriteFinish: true,
// });

// watcher
//   .on('add', function (p) {
//     console.log('File', p, 'has been added');
//   })
//   .on('change', function (p) {
//     console.log('File', p, 'has been changed');
//   })
//   .on('unlink', function (p) {
//     console.log('File', p, 'has been removed');
//   })
//   .on('error', function (error) {
//     console.error('Error happened', error);
//   });

const app = express();

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
