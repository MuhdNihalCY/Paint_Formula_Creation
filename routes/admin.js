var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/adminHelpers');

const AdminUser = {
  userName: "AdminMP",
  password: "1"
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  adminHelpers.getCategory().then((AllCategory) => {
    console.log("Calling Admin Dash")
    if (req.query.Error) {
      res.render('admin/Dashboard', { admin: true, AllCategory, AddError: req.query.Error });
    }
    res.render('admin/Dashboard', { admin: true , AllCategory });
  })
});

router.post('/addCategory', (req, res) => {
  console.log(req.body);
  adminHelpers.AddCategory(req.body).then((State) => {
    console.log(State)
    if (State.Status) {
      res.redirect('/admin');
    } else {
      res.redirect(`/admin/?Error=${State.error}`);
    }
  })
})

router.get('/Detele-Category/:id',(req,res)=>{
  adminHelpers.DeleteCategory(req.params.id).then((State)=>{
   res.redirect('/admin');
  })
})

router.get('/Sub-Category', (req, res) => {
  res.render('admin/subCategory', { admin: true });
})

router.get('/Product', (req, res) => {
  res.render('admin/product', { admin: true });
})

router.get('/Additives', (req, res) => {
  res.render('admin/Additives', { admin: true });
})

router.get('/Binders', (req, res) => {
  res.render('admin/Binders', { admin: true });
})

router.get('/Employees', (req, res) => {
  res.render('admin/Employees', { admin: true });
})

router.get('/Customers', (req, res) => {
  res.render('admin/Customer', { admin: true });
})

module.exports = router;
