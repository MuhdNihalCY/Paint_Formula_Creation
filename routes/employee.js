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
    employeeHelpers.GetAllAdditives().then((Additives) => {
      // console.log(AllCategory);
      res.render('employee/CreateFormula', { AllCategory, Additives });
    })
  })
})

router.post('/GetProductWithSubCatagory/api', (req, res) => {
  //console.log(req.body);
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
              //console.log(Data);
              res.json(Data);
            })
          } else {
            var Data = {
              Products: Products,
              SubCategory: SubCategory,
              Binder1: binder1
            }
            // console.log(Data);
            res.json(Data);
          }

        })

      } else {
        //console.log(SubCategory)
        var Data = {
          Products: Products,
          SubCategory: SubCategory
        }
        //console.log(Data);
        res.json(Data);
      }
    })
  })
})

router.post('/GetProductsSolidContent/api', (req, res) => {
  //console.log("ProductsHere: ",req.body);
  employeeHelpers.GetProductByArrayOfProductById(req.body.selectedOption).then((Products) => {
    res.json(Products);
  })
})

router.post('/FindProductByName/api', (req, res) => {
  // console.log("Productname: ",req.body);
  employeeHelpers.FindProductByName(req.body.selectedProduct).then((Product) => {
    res.json(Product);
  })
})


router.post('/FindAdditiveBinderDensityById/api', async (req, res) => {
  console.log(req.body.ADditiveBinder);
  var BodyObject = req.body.ADditiveBinder

  var ReturnObject = {};

  var promises = [];

  if (BodyObject.Binder1) {
    var promise1 = employeeHelpers.FindBinderByName(BodyObject.Binder1).then((Binder1) => {
      ReturnObject.Binder1 = Binder1;
    });
    promises.push(promise1);
  }

  if (BodyObject.Binder2) {
    var promise2 = employeeHelpers.FindBinderByName(BodyObject.Binder2).then((Binder2) => {
      ReturnObject.Binder2 = Binder2;
    });
    promises.push(promise2);
  }

  if (BodyObject.Additive) {
    var promise3 = employeeHelpers.FindAdditiveDensityById(BodyObject.Additive).then((Additive) => {
      ReturnObject.Additive = Additive;
    });
    promises.push(promise3);
  }

  await Promise.all(promises); // Wait for all promises to resolve

  console.log("Return OBJ: ", ReturnObject);

  res.json(ReturnObject);
});


router.post('/CreateFormula', (req, res) => {
  console.log(req.body);
  function calculateRatios(data) {
    const ratios = {};

    // Get the Total Quantity
    const totalQty = parseFloat(data.TotalQtyInGram);

    // Calculate the ratios
    ratios.totalQty = 1;
    ratios.additive = totalQty !== 0 ? parseFloat(data.TotalAdditives) / totalQty : 0;
    ratios.binder1 = totalQty !== 0 ? parseFloat(data.Binder1) / totalQty : 0;
    ratios.binder2 = totalQty !== 0 ? parseFloat(data.Binder2 || 0) / totalQty : 0;

    ratios.tinters = {};
    const tinterKeys = Object.keys(data).filter(key => key.startsWith('GramInputTotalR'));
    const tinterCount = tinterKeys.length;
    const tinterSum = tinterKeys.reduce((sum, key) => sum + parseFloat(data[key] || 0), 0);
    tinterKeys.forEach((key, index) => {
      const tinterNo = key.slice(15);
      ratios.tinters[tinterNo] = totalQty !== 0 ? (parseFloat(data[key]) || 0) / totalQty : 0;
    });

    return ratios;
  }

  var Datas = req.body;


  // Usage
  const data = {
    TotalQtyInGram: Datas.TotalQtyInGram,
    TotalAdditives: Datas.TotalAdditives,
    Binder1: Datas.Binder1,
    Binder2: Datas.Binder2,
    GramInputTotalR1: Datas.GramInputTotalR1,
    GramInputTotalR2: Datas.GramInputTotalR2,
    GramInputTotalR3: Datas.GramInputTotalR3
  };

  const result = calculateRatios(data);
  console.log('Total Quantity:', result.totalQty);
  console.log('Additive Ratio:', result.additive);
  console.log('Binder1 Ratio:', result.binder1);
  console.log('Binder2 Ratio:', result.binder2);
  console.log('Tinters Ratios:', result.tinters);
  Datas.AdditiveRatio = result.additive;
  Datas.Binder1Ratio = result.binder1;
  Datas.Binder2Ratio = result.binder2;
  Datas.TintersRatioObject = result.tinters;
  Datas.TintersRatioArray = Object.values(result.tinters);
  Datas.TintersCount = Datas.TintersRatioArray.length;
  Datas.InsertedTime = Date.now()



  employeeHelpers.SaveFormulaData(Datas).then((State) => {
    res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
  })

})



module.exports = router;
