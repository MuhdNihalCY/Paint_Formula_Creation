var express = require('express');
var router = express.Router();
var EmployeeHeplers = require('../helpers/employeeHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');



// verify login
const verifyLogin = (req, res, next) => {
  if (req.session.EmployeeLogged) {
    next()
  } else {
    res.redirect('/login');
  }
}


/* GET home page. */
router.get('/', verifyLogin, function (req, res, next) {
  res.render('employee/home');
});

router.get('/login', (req, res) => {
  var loginpage = true
  res.render('employee/login', { loginpage });
})

router.post('/login', (req, res) => {
  console.log(req.body);
  employeeHelpers.DoLogin(req.body).then((State) => {
    if (State.employeeLooged) {
      //user OK
      // Store Session
      req.session.EmployeeLogged = true;
      req.session.EmployeeName = req.body.userName;
      res.redirect('/'); // redirect to employee home.
    } else {
      // incorrect
      var loginpage = true
      res.render('employee/login', { loginpage, Err: State.err });
    }
  })
})

router.get('/printlabel', verifyLogin, (req, res) => {
  res.render('employee/Invoice')
})

router.get('/CreateFormula', verifyLogin, (req, res) => {
  employeeHelpers.getAllCollections().then((AllCategory) => {
    employeeHelpers.GetAllAdditives().then((Additives) => {
      // console.log(AllCategory);
      employeeHelpers.getThisFormulaFileNo().then((FileNo) => {
        var MixerName = req.session.EmployeeName;
        res.render('employee/CreateFormula', { AllCategory, Additives, FileNo, MixerName });
      })
    })
  })
})

router.post('/GetProductWithSubCatagory/api', verifyLogin, (req, res) => {
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

router.post('/GetProductsSolidContent/api', verifyLogin, (req, res) => {
  //console.log("ProductsHere: ",req.body);
  employeeHelpers.GetProductByArrayOfProductById(req.body.selectedOption).then((Products) => {
    res.json(Products);
  })
})

router.post('/FindProductByName/api', verifyLogin, (req, res) => {
  // console.log("Productname: ",req.body);
  employeeHelpers.FindProductByName(req.body.selectedProduct).then((Product) => {
    res.json(Product);
  })
})


router.post('/FindAdditiveBinderDensityById/api', verifyLogin, async (req, res) => {
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

  employeeHelpers.getAllCategories().then((AllCategory) => {
    employeeHelpers.GetAllSubCategories().then((AllSubCategory) => {

      // Mapping CategoryName
      const CategoryMap = {};
      AllCategory.forEach(category => {
        CategoryMap[category.Category_Id] = category.Category;
      });

      Datas.CategoryName = CategoryMap[Datas.Category];

      // Mapping SubCategoryName
      const SubCategoryMap = {};
      AllSubCategory.forEach(subCategory => {
        SubCategoryMap[subCategory.SubCategory_Id] = subCategory.SubCategory;
      });

      Datas.SubCategoryName = SubCategoryMap[Datas.SubCategory];

      employeeHelpers.GetAllProducts().then((Tinters) => {
        //console.log(Tinters)
        // Create a map of Tinter IDs to Tinter names
        const tinterMap = Tinters.reduce((map, tinter) => {
          map[tinter.Product_Id] = tinter.Product_Name;
          return map;
        }, {});

        // Iterate over each TinterR1, TinterR2, TinterR3 property in Datas
        for (let i = 1; i <= Datas.TintersCount; i++) {
          const tinterId = Datas[`TintersR${i}`];
          if (tinterId && tinterMap.hasOwnProperty(tinterId)) {
            Datas[`TinterNameR${i}`] = tinterMap[tinterId];
          }
        }
        employeeHelpers.FindAdditiveById(Datas.additives).then((Additive) => {
          //console.log(Additive);
          Datas.AdditiveName = Additive.Additive_Name;

          employeeHelpers.GetSubCategoriesById(Datas.SubCategory).then((SubCategory) => {
            //console.log(SubCategory)
            if (SubCategory.Binder1) {
              employeeHelpers.getBinderById(SubCategory.Binder1).then((Binder1) => {
                //console.log("Binder1: ", Binder1)
                if (SubCategory.Binder2) {
                  employeeHelpers.getBinderById(SubCategory.Binder2).then((Binder2) => {
                    // console.log("Binder2: ", Binder2)
                    Datas.Binder1Name = Binder1.Binder_Name;
                    Datas.Binder2Name = Binder2.Binder_Name;
                    // res .send data
                    employeeHelpers.SaveFormulaData(Datas).then((State) => {
                      res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                    })
                  })
                } else {
                  Datas.Binder1Name = Binder1.Binder_Name;
                  // res .send data
                  employeeHelpers.SaveFormulaData(Datas).then((State) => {
                    res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                  })
                }
              })
            } else {
              // res .send data
              employeeHelpers.SaveFormulaData(Datas).then((State) => {
                res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
              })
            }
          })
          //console.log(Datas);
        })
      })

    })
  })
})

router.get('/FormulaList', verifyLogin, (req, res) => {
  employeeHelpers.GetAllFormulations().then((Formulation) => {
    employeeHelpers.getAllCategories().then((AllCategory) => {
      //console.log(AllCategory);

      // Mapping the Category names to the Formulation array
      const updatedFormulation = Formulation.map((item) => {
        const category = AllCategory.find((cat) => cat.Category_Id === parseInt(item.Category));
        const categoryName = category ? category.Category : '';
        return { ...item, CategoryName: categoryName };
      });

      //console.log(updatedFormulation);

      Formulation = updatedFormulation;

      res.render('employee/FormulaList', { Formulation });
    })
  })
})

router.get('/BulkOrder/:FileNo', verifyLogin, (req, res) => {
  var FileNo = req.params.FileNo;
  employeeHelpers.FindFormulaByFileNo(FileNo).then((Formulation) => {
    //console.log(Formulation);
    var Binder1 = false;
    var Binder2 = false;
    if (Formulation.Binder1) {
      Binder1 = true;
    }
    if (Formulation.Binder2) {
      Binder2 = true;
    }

    var Liter = false;
    employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
      if (Sub_Category.Liter) {
        Liter = true
      }
      res.render("employee/BulkOrder", { Formulation, Binder1, Binder2, Liter });
    })
  })
})

router.get('/api/BulkOrder/:FileNo', verifyLogin, (req, res) => {
  var FileNo = req.params.FileNo;
  employeeHelpers.FindFormulaByFileNo(FileNo).then((Formulation) => {
    //console.log(Formulation);
    var Binder1 = false;
    var Binder2 = false;
    if (Formulation.Binder1) {
      Binder1 = true;
    }
    if (Formulation.Binder2) {
      Binder2 = true;
    }

    employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
      var Data = {
        Formulation: Formulation,
        Binder1: Binder1,
        Binder2: Binder2,
        Sub_Category: Sub_Category
      }

      res.json(Data);

    })

  })
})


router.post('/BulkOrder/:id',(req,res)=>{
  console.log(req.body);
  let id=req.params.id;
})



module.exports = router;
