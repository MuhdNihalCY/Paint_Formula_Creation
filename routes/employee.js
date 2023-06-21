var express = require('express');
var router = express.Router();
var EmployeeHeplers = require('../helpers/employeeHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('employee/home');
});

router.get('/login', (req, res) => {
  var loginpage = true
  res.render('employee/login', { loginpage });
})

router.get('/printlabel', (req, res) => {
  res.render('employee/Invoice')
})

router.get('/CreateFormula', (req, res) => {
  employeeHelpers.getAllCollections().then((AllCategory) => {
   // console.log(AllCategory);
    res.render('employee/CreateFormula', { AllCategory });
  })
})

router.post('/GetProductWithSubCatagory/api', (req, res) => {
  console.log(req.body);
  var SubId = req.body.selectedOption;
  employeeHelpers.GetSubcategotyById(SubId).then((SubCategory) => {

    employeeHelpers.GetProductBySubId(SubId).then((Products) => {

      if (SubCategory.Binder1) {
        employeeHelpers.getBinderById(SubCategory.Binder1).then((binder1) => {

          if (SubCategory.Binder2) {
            employeeHelpers.getBinderById(SubCategory.Binder2).then((binder2) => {
              var Data = {
                Products: Products,
                SubCategory: SubCategory,
                Binder1: binder1,
                Binder2: binder2
              }
              console.log(Data);
              res.json(Data);
            })
          } else {
            var Data = {
              Products: Products,
              SubCategory: SubCategory,
              Binder1: binder1
            }
            console.log(Data);
            res.json(Data);
          }

        })

      } else {
        console.log(SubCategory)
        var Data = {
          Products: Products,
          SubCategory: SubCategory
        }
        console.log(Data);
        res.json(Data);
      }
    })
  })
})

router.post('/CreateFormula', (req, res) => {
  console.log(req.body);
})



module.exports = router;
