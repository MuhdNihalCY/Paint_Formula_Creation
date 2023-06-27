var express = require('express');
var router = express.Router();
var EmployeeHeplers = require('../helpers/employeeHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');



// verify login
const verifyLogin = (req, res, next) => {
  if (req.session.EmployeeLogged) {
    next()
  } else {
    next()
    //res.redirect('/login');
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
                      res.redirect(`/BulkOrder/${Datas.FileNo}`)
                      // res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                    })
                  })
                } else {
                  Datas.Binder1Name = Binder1.Binder_Name;
                  // res .send data
                  employeeHelpers.SaveFormulaData(Datas).then((State) => {
                    res.redirect(`/BulkOrder/${Datas.FileNo}`)
                    //res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                  })
                }
              })
            } else {
              // res .send data
              employeeHelpers.SaveFormulaData(Datas).then((State) => {
                res.redirect(`/BulkOrder/${Datas.FileNo}`)
                //res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
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

  //employeeHelpers.AddStocksToBinders()

  // Extract the query parameters
  var { Stock, Item, TotalQTY } = req.query;

  console.log("Stock: ", Stock, " Item : ", Item, " TotalQTY: ", TotalQTY);

  if (Stock) {
    // low stocks
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
        res.render("employee/BulkOrder", { Formulation, Binder1, Binder2, Liter, TotalQTY, Item });
      })
    })

  } else {
    // no query , 
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
  }
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
      //console.log(Data);
      res.json(Data);

    })

  })
})

router.post('/BulkOrder/:id', verifyLogin, async (req, res) => {
  var OrderFile = req.body;
  let id = req.params.id;
  var TotalQty = OrderFile.Quantity;
  var LowStockFlag = {
    Status: false
  };

  try {
    let FormulaFile = await employeeHelpers.GetFormulaByFileNo(id);
    let TinterCount = parseInt(FormulaFile.TintersCount);

    OrderFile.TinterCount = TinterCount;

    let promises = [];

    for (let i = 1; i <= TinterCount; i++) {
      var TinterName = OrderFile["TineterName" + i];
      var TinterQty = OrderFile["TinterGram" + i];
      console.log("Tinter Name : " + TinterName + " Qty : " + TinterQty);

      promises.push(employeeHelpers.TinterCheckStock(TinterName, TinterQty));
    }

    let states = await Promise.all(promises);

    for (let i = 0; i < states.length; i++) {
      let State = states[i];
      console.log(State);
      if (!State.HaveStock) {
        LowStocks(OrderFile["TineterName" + (i + 1)], TotalQty);
        LowStockFlag.Status = true;
        return; // Exit the loop when there is low stock
      }
    }

    // All stocks are available, continue processing

    //check Binder Stocks and Additives Stock.

    if (OrderFile.Binder1) {
      var Binder1Qty = OrderFile.Binder1QTY;
      let binder1State = await employeeHelpers.BinderCheckStock(OrderFile.Binder1, Binder1Qty);
      if (!binder1State.HaveStock) {
        LowStocks(OrderFile.Binder1, TotalQty);
        console.log(" Binder1 Stocks are not available. ");
        LowStockFlag.Status = true;
        return; // Exit the loop when there is low stock
      }
      if (OrderFile.Binder2) {
        var Binder2Qty = OrderFile.Binder2QTY;
        let binder2State = await employeeHelpers.BinderCheckStock(OrderFile.Binder2, Binder2Qty);
        if (!binder2State.HaveStock) {
          LowStocks(OrderFile.Binder2, TotalQty);
          console.log(" Binder2 Stocks are not available. ");
          LowStockFlag.Status = true;
          return; // Exit the loop when there is low stock
        }
      }
    }

    if (OrderFile.Additive) {
      var AdditiveQTY = OrderFile.AdditiveQTY;
      let additiveState = await employeeHelpers.AdditiveCheckStock(OrderFile.Additive, AdditiveQTY);
      if (!additiveState.HaveStock) {
        LowStocks(OrderFile.Additive, TotalQty);
        console.log(" Additive Stocks are not available. ");
        LowStockFlag.Status = true;
        return; // Exit the loop when there is low stock
      }
    }

    console.log(" Tinter Stocks are available. ");

  } catch (error) {
    console.error(error);
  }

  if (!LowStockFlag.Status) {
    BulkOrderNow(OrderFile);
  }

  function BulkOrderNow(orderFile) {
    employeeHelpers.BulkOrderUpdate(orderFile).then(() => {
      // Rest of the code...
      console.log("Bulk Updated!");
      res.redirect('/Orders');
    });
  }

  function LowStocks(tinterName, TotalQty) {
    var FileNo = id;
    var stockQuery = "low";
    var itemQuery = tinterName;
    var TotalQTY = TotalQty;

    var url = `/BulkOrder/${FileNo}?Stock=${stockQuery}&Item=${itemQuery}&TotalQTY=${TotalQTY}`;
    res.redirect(url);
  }
});

router.get('/UpdateStocks', verifyLogin, (req, res) => {
  employeeHelpers.GetAllProducts().then((products) => {
    // console.log(Products);
    employeeHelpers.getAllCategories().then((AllCategory) => {
      employeeHelpers.GetAllSubCategories().then((AllSubCategory) => {
        var Products = products
        var Categories = AllCategory;
        var Sub_Categories = AllSubCategory;

        // console.log("Products:", Products);
        // console.log("Categories:", Categories);
        // console.log("Sub_Categories:", Sub_Categories);


        // Function to modify the Products array
        function modifyProductsArray() {
          // Loop through each product
          for (var i = 0; i < Products.length; i++) {
            var product = Products[i];

            // Find the matching category
            var category = Categories.find(function (category) {
              return category.Category_Id === parseInt(product.Category);
            });

            // Find the matching subcategory
            var subcategory = Sub_Categories.find(function (subcategory) {
              return subcategory.SubCategory_Id === parseInt(product.SubCategory);
            });

            // Add category name and subcategory name to the product object
            if (category) {
              product.Category_Name = category.Category;
            }
            if (subcategory) {
              product.SubCategory_Name = subcategory.SubCategory;
            }
          }

          // Print the modified Products array
          // console.log("Modified Products:", Products);
        }

        // Call the function to modify the Products array
        modifyProductsArray();

        res.render('employee/UpdateStocks', { Products });
        // res.json(Products)
      })
    })
  })
})


router.post('/UpdateProductStock/:id', verifyLogin, (req, res) => {
  var Data = req.body;
  Data.ProductId = req.params.id;
  //console.log(Data);
  employeeHelpers.UpdateProductStockById(Data).then(()=>{
    res.redirect('/UpdateStocks');
  }) 

})

router.get('/BinderStockUpdate',verifyLogin,(req,res)=>{
  employeeHelpers.GetAllBinders().then((Binders)=>{
    res.render('employee/BinderStockUpdate',{Binders});
  })
})

router.post('/UpdateBinderStock/:id', verifyLogin, (req, res) => {
  var Data = req.body;
  Data.ProductId = req.params.id;
  console.log(Data);
  employeeHelpers.UpdateBinderStockById(Data).then(()=>{
    res.redirect('/BinderStockUpdate');
  }) 
})

router.get('/AdditiveStockUpdate',verifyLogin,(req,res)=>{
  employeeHelpers.GetAllAdditives().then((Additives)=>{
    res.render('employee/AdditiveStockUpdate',{Additives});
  })
})


router.post('/UpdateAdditiveStock/:id', verifyLogin, (req, res) => {
  var Data = req.body;
  Data.ProductId = req.params.id;
  console.log(Data);
  employeeHelpers.UpdateAdditiveStockById(Data).then(()=>{
    res.redirect('/AdditiveStockUpdate');
  }) 
})


module.exports = router;
