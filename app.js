var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var db = require('./config/connection');
var session = require('express-session');
const fileUpload = require('express-fileupload');
// const bodyParser = require('body-parser');


var EmployeeRouter = require('./routes/employee');
var AdminRouter = require('./routes/admin');
var CustomerRouter = require('./routes/customer');
var SalesRouter = require('./routes/sales');
var OfficeRouter = require('./routes/office');
var ManagerRouter = require('./routes/manager');
var DispatcherRouter = require('./routes/dispatcher');
var DriverRouter = require('./routes/driver');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
// find IP
app.set("trust proxy", true);


app.use(logger('dev'));
app.use(express.json());
// app.use(express.json({ limit: '5mb' }));
// app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload()); // Enable file uploads
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 2592000000 }
})); // session upto 30 days ,  for 1 minute apply 60000, for 5 minutes 300000 

// Increase payload size limit (adjust the limit as needed)
// app.use(bodyParser.json({ limit: '5mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
// Parse JSON-encoded data

// Parse URL-encoded data

// db.connect((err)=>{
//   if(err) {
//     console.log("connection error: "  + err);
//   }else{
//     console.log("Database connection established");
//   } 
// })


const startApp = async () => {
  try {
    await db.connect();
    console.log("Database connection established on port 3000");
  } catch (err) {
    console.error("Connection error: " + err);
  }
}

startApp();


// db.connect()
//   .then(() => {
//     console.log("Database connection established on port 3000");
//     // add your application code here
//   })
//   .catch((err) => {
//     console.log("Connection error: " + err);
//   });

app.use('/', EmployeeRouter);
app.use('/admin', AdminRouter);
app.use('/customer', CustomerRouter);
app.use('/sales', SalesRouter);
app.use('/office', OfficeRouter);
app.use('/dispatcher', DispatcherRouter);
app.use('/driver', DriverRouter);
app.use('/manager', ManagerRouter);

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
  res.render('error', { FullErrorPage: true });
});

module.exports = app;
