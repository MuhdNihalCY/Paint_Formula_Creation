var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('employee/home');
});

router.get('/login',(req,res)=>{
  var loginpage = true
  res.render('employee/login',{loginpage});
})

router.get('/printlabel',(req,res)=>{
  res.render('employee/Invoice')
})

router.get('/CreateFormula',(req,res)=>{
  res.render('employee/CreateFormula')
})

module.exports = router;
