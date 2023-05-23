var express = require('express');
var router = express.Router();

const AdminUser = {
  userName: "AdminMP",
  password: "1"
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/Dashboard',{admin:true});
});

router.get('/Sub-Category', (req,res)=>{
  res.render('admin/subCategory',{admin:true});
})

router.get('/Product',(req,res)=>{
  res.render('admin/product',{admin:true});
})

router.get('/Additives',(req,res)=>{
  res.render('admin/Additives',{admin:true});
})

router.get('/Binders',(req,res)=>{
  res.render('admin/Binders',{admin:true});
})

router.get('/Employees',(req,res)=>{
  res.render('admin/Employees',{admin:true});
})

router.get('/Customers',(req,res)=>{
  res.render('admin/Customer',{admin:true});
})

module.exports = router;
