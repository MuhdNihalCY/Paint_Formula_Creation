var express = require('express');
var router = express.Router();
var EmployeeHeplers = require('../helpers/employeeHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');
const { json } = require('express/lib/response');
const trelloHelpers = require('../helpers/trelloHelpers');


// verify login 
const EmployeeVerifyLogin = (req, res, next) => {
  if (req.session.EmployeeLogged) {
    next()
  } else {
    res.redirect('/login');
    // next()
  }
}




/* GET home page. */
router.get('/', EmployeeVerifyLogin, function (req, res, next) {
  var EmployeeName = req.session.EmployeeName;

  var Products = false;
  var Binders = false;
  var Additives = false;

  employeeHelpers.getProductsWithLowStocks().then((products) => {
    // console.log('Products: ',Products)
    if (products.length > 0) {
      Products = products
      for (let i = 0; i < Products.length; i++) {
        let product = Products[i];
        product.Stock = parseFloat(product.Stock).toFixed(3);
      }
    }
    employeeHelpers.getAllBinderWithLowStocks().then((binders) => {
      // console.log("Binders: ",Binders)
      if (binders.length > 0) {
        Binders = binders;
        for (let i = 0; i < Binders.length; i++) {
          let binder = Binders[i];
          binder.Stock = parseFloat(binder.Stock).toFixed(3);
        }
      }
      employeeHelpers.getAllAdditivesWithLowStocks().then((additives) => {
        //console.log("Additive: ", Additives )
        if (additives.length > 0) {
          Additives = additives;
          for (let i = 0; i < Additives.length; i++) {
            let Additive = Additives[i];
            Additive.Stock = parseFloat(Additive.Stock).toFixed(3);
          }
        }

        res.render('employee/home', { EmployeeName, Products, Binders, Additives });
      })
    })

  })
});

router.get('/getAllFormula/api', EmployeeVerifyLogin, (req, res) => {
  employeeHelpers.GetAllFormulations().then((Formula) => {
    // console.log(Formula);
    res.json(Formula);
  })
})

router.get('/logout', EmployeeVerifyLogin, (req, res) => {

  req.session.EmployeeLogged = false;
  req.session.EmployeeData = "";
  req.session.EmployeeName = "";

  res.redirect('/login');
})

router.get('/login', (req, res) => {
  var loginpage = true
  res.render('employee/login', { loginpage });
})

router.post('/login', (req, res) => {
  employeeHelpers.DoLogin(req.body).then((UserState) => {
    if (UserState.error) {
      // not user matvh
      var loginpage = true
      res.render('employee/login', { loginpage, StateErr: UserState.error });
    } else {
      // user Match
      var UserData = UserState.User;
      var UserDesignation = UserData.Designation;
      switch (UserDesignation) {
        case 'Manager':
          storeManager(UserData);
          storeEmployees(UserData);
          break;
        case 'Production':
          storeEmployees(UserData);
          break;
        case 'Customer':
          storeCustomer(UserData);
          break;
        case 'Sales':
          storeSales(UserData);
          break;
        case 'Office':
          storeOffice(UserData);
          break;
        case 'Dispatcher':
          storeDispatcher(UserData);
          break;
        case 'Driver':
          storeDriver(UserData);
          break;
        default:
          res.redirect('/login'); // Redirect to a default page for unknown designations
      }

      function storeEmployees(UserData) {
        req.session.EmployeeLogged = true;
        req.session.EmployeeData = UserData;
        req.session.EmployeeName = UserData.UserName;
        res.redirect('/'); // redirect to employee home.
      }

      function storeCustomer(UserData) {
        req.session.CustomerLogged = true;
        req.session.CustomerData = UserData;
        res.redirect('/customer');
      }

      function storeManager(UserData) {
        req.session.ManagerLogged = true;
        req.session.ManagerData = UserData;
        // res.redirect('/manager');
      }


      function storeSales(UserData) {
        req.session.SalesLogged = true;
        req.session.SalesData = UserData;
        res.redirect('/sales');
      }


      function storeOffice(UserData) {
        req.session.OfficeLogged = true;
        req.session.OfficeData = UserData;
        res.redirect('/office');
      }


      function storeDispatcher(UserData) {
        req.session.DispatcherLogged = true;
        req.session.DispatcherData = UserData;
        res.redirect('/dispatcher');
      }

      function storeDriver(UserData) {
        req.session.DriverLogged = true;
        req.session.DriverData = UserData;
        res.redirect('/driver');
      }

    }
  })
})

router.get('/printlabel/:orderNo', (req, res) => {
  var OrderNo = req.params.orderNo;
  employeeHelpers.getOrderByInsertedTime(OrderNo).then((Order) => {
    var Print = true;
    //console.log("Order",Order)
    employeeHelpers.GetSubCategoriesByName(Order.SubCategory).then((SubCategory) => {
      var Liter = false
      if (SubCategory.Liter) {
        Liter = true;
      }

      var SC = Order;
      SC.SolidContent = parseFloat(SC.SolidContent).toFixed(2)

      SC.Density = parseFloat(SC.Density).toFixed(2)

      SC.VOC = parseFloat(SC.VOC).toFixed(2)

      var Mipa = false;
      if (SubCategory.Mipa) {
        Mipa = true;
      }

      //date Formate
      // Timestamp value
      const timestamp = parseInt(Order.InsertedTime);

      // Create a new Date object using the timestamp
      const date = new Date(timestamp);

      // Define the month names
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Get the day, month, year, hours, and minutes from the Date object
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Format the date and time string
      const formattedDate = `${day}-${month}-${year}`;
      const formattedTime = `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
      const DateTime = `${formattedDate} ${formattedTime}`;

      //console.log(DateTime);

      res.render('employee/Invoice', { Order, Print, Liter, DateTime, Mipa })

    })
  })
})

router.get('/CreateFormula', EmployeeVerifyLogin, (req, res) => {
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

router.get('/CreateFormulas', EmployeeVerifyLogin, (req, res) => {
  employeeHelpers.getAllCollections().then((AllCategory) => {
    employeeHelpers.GetAllAdditives().then((Additives) => {
      // console.log(AllCategory);
      employeeHelpers.getThisFormulaFileNo().then((FileNo) => {
        var MixerName = req.session.EmployeeName;
        res.render('employee/CreateFormulas', { AllCategory, Additives, FileNo, MixerName });
      })
    })
  })
})

router.post('/GetProductWithSubCatagory/api', (req, res) => {  //EmployeeVerifyLogin,
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

router.post('/GetProductsSolidContent/api', (req, res) => {  //EmployeeVerifyLogin, 
  //console.log("ProductsHere: ",req.body);
  employeeHelpers.GetProductByArrayOfProductById(req.body.selectedOption).then((Products) => {
    res.json(Products);
  })
})

router.post('/GetProductsSolidContentByName/api', (req, res) => {  //EmployeeVerifyLogin, 
  //console.log("ProductsHere: ",req.body);
  employeeHelpers.GetProductByArrayOfProductByName(req.body.selectedOption).then((Products) => {
    res.json(Products);
  })
})

router.post('/FindProductByName/api', (req, res) => {  //EmployeeVerifyLogin,
  // console.log("Productname: ",req.body);
  employeeHelpers.FindProductByName(req.body.selectedProduct).then((Product) => {
    res.json(Product);
  })
})


router.post('/FindAdditiveBinderDensityById/api', async (req, res) => {  // EmployeeVerifyLogin,
  // console.log(req.body.ADditiveBinder);
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

  // console.log("Return OBJ: ", ReturnObject);

  res.json(ReturnObject);
});


router.post('/CreateFormula', (req, res) => {

  function StoreRefImage(SavedData) {
    if (req.files) {
      const imageData = req.files.Image;
      // console.log('Image data:', imageData);

      imageData.mv('./public/images/RefImages/' + SavedData.FileNo + ".jpg", (err) => {
        if (!err) {
        } else {
          console.log("Error at img1 " + err)
        }
      })
    }
  }


  // console.log(req.body);
  function calculateRatios(data) {
    console.log("Calculating Data: ", data);
    const ratios = {};

    // Get the Total Quantity
    const totalQty = parseFloat(data.TotalQtyInGram);

    // Calculate the ratios
    ratios.totalQty = 1;
    ratios.additive = totalQty !== 0 ? parseFloat(data.TotalAdditives) / totalQty : 0;
    ratios.binder1 = totalQty !== 0 ? parseFloat(data.Binder1) / totalQty : 0;
    ratios.binder2 = totalQty !== 0 ? parseFloat(data.Binder2 || 0) / totalQty : 0;

    // calculate VOLUME Ratio
    const TotalVolume = parseFloat(data.TotalQtyInLiter);
    //console.log("TotalVolume", TotalVolume);

    ratios.totalVolume = 1;
    ratios.additiveVolume = TotalVolume !== 0 ? parseFloat(data.TotalAdditivesVolume) / TotalVolume : 0;
    ratios.binder1Volume = TotalVolume !== 0 ? parseFloat(data.Binder1Volume) / TotalVolume : 0;
    ratios.binder2Volume = TotalVolume !== 0 ? parseFloat(data.Binder2Volume || 0) / TotalVolume : 0;



    ratios.tinters = {};
    const tinterKeys = Object.keys(data).filter(key => key.startsWith('GramInputTotalR'));
    const tinterCount = tinterKeys.length;
    const tinterSum = tinterKeys.reduce((sum, key) => sum + parseFloat(data[key] || 0), 0);
    tinterKeys.forEach((key, index) => {
      const tinterNo = key.slice(15);
      ratios.tinters[tinterNo] = totalQty !== 0 ? (parseFloat(data[key]) || 0) / totalQty : 0;
    });

    ratios.tintersVolume = {};
    const tinterVolumeKeys = Object.keys(data).filter(key => key.startsWith('LiterInputTotalR'));
    const tinterVolumeCount = tinterVolumeKeys.length;
    const tinterVolumeSum = tinterVolumeKeys.reduce((sum, key) => sum + parseFloat(data[key] || 0), 0);
    tinterVolumeKeys.forEach((key, index) => {
      const tinterNo = key.slice(15);
      ratios.tintersVolume[tinterNo] = TotalVolume !== 0 ? (parseFloat(data[key]) || 0) / TotalVolume : 0;
    });

    return ratios;
  }

  async function CalculateCostOfAll(ReqData) {
    var TintersCount = ReqData.TintersRatioArray.length;

    // Find Product Price and Unit
    const productPromises = []; // Array to store promises

    for (let i = 1; i <= TintersCount; i++) {
      // Dynamically access the variable using bracket notation
      let TintervariableName = `TinterNameR${i}`;
      let TinterPriceVariable = `TinterPriceR${i}`;
      let TinterPriceUnitVariable = `TinterPriceUnit${i}`;
      let TinterDensityCount = `TinterDensity${i}`;

      var Tinter = ReqData[TintervariableName];

      // Store the promise in the array
      const productPromise = employeeHelpers.getProductByName(Tinter).then((Product) => {
        ReqData[TinterPriceVariable] = Product.Price;
        ReqData[TinterPriceUnitVariable] = Product.PriceUnit;
        ReqData[TinterDensityCount] = Product.Product_Density;
      });

      productPromises.push(productPromise); // Add promise to the array
      // console.log(ReqData[TintervariableName]);
    }

    // Wait for all the getProductByName promises to complete before proceeding
    await Promise.all(productPromises);

    // console.log("ReqData: ", ReqData);

    // Find Binder Price unit
    if (ReqData.Binder1Ratio) {
      await employeeHelpers.GetSubcategotyByName(ReqData.SubCategoryName).then(async (SubCategory) => {
        var Binder1ID = SubCategory.Binder1
        await employeeHelpers.GetBinderById(Binder1ID).then((Binder1) => {
          if (Binder1) {
            ReqData.Binder1Price = Binder1.cost;
            ReqData.Binder1PriceUnit = Binder1.PriceUnit;
            ReqData.Binder1_Density = Binder1.Binder_Density;
          }
        })
        if (ReqData.Binder2Ratio) {
          const Binder2ID = SubCategory.Binder2;
          const Binder2 = await employeeHelpers.GetBinderById(Binder2ID);
          if (Binder2) {
            ReqData.Binder2Price = Binder2.cost;
            ReqData.Binder2PriceUnit = Binder2.PriceUnit;
            ReqData.Binder2_Density = Binder2.Binder_Density;
          }
        }

      })
    }

    // Find Additive Price and unit
    if (ReqData.AdditiveRatio) {
      var AdditiveID = ReqData.additives;
      await employeeHelpers.getAdditivesById(AdditiveID).then((Additive) => {
        ReqData.AdditivePrice = Additive.cost;
        ReqData.AdditivePriceUnit = Additive.PriceUnit;
        ReqData.Additive_Density = Additive.Additive_Density;
      });
    }

    // console.log("ReqData: ", ReqData);

    return ReqData;

  }


  var Datas = req.body;

  // console.log("Req.body datas: ", Datas)


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

  const result = calculateRatios(Datas);
  // console.log('Total Quantity:', result.totalQty);
  // console.log('Additive Ratio:', result.additive);
  // console.log('Binder1 Ratio:', result.binder1);
  // console.log('Binder2 Ratio:', result.binder2);
  // console.log('Tinters Ratios:', result.tinters);
  Datas.AdditiveRatio = result.additive;
  Datas.Binder1Ratio = result.binder1;
  Datas.Binder2Ratio = result.binder2;
  Datas.AdditiveVolumeRatio = result.additiveVolume;
  Datas.Binder1VolumeRatio = result.binder1Volume;
  Datas.Binder2VolumeRatio = result.binder2Volume;
  Datas.TintersRatioObject = result.tinters;
  Datas.TintersVolumeRatioObject = result.tintersVolume;


  // console.log("Tinters Ratio: ", result.tinters);
  for (var key in result.tinters) {
    if (result.tinters[key] === 0) {
      delete result.tinters[key];
    }
  }
  // console.log("Tinters Ratio: ", result.tinters);
  Datas.TintersRatioArray = Object.values(result.tinters);
  Datas.TintersVolumeRatioArray = Object.values(result.tintersVolume);

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

        // console.log(Datas);
        async function CostFindingAndRemainigTasks(Datas) {
          Datas = await CalculateCostOfAll(Datas);
          // console.log("REERE", Datas);


          employeeHelpers.FindAdditiveById(Datas.additives).then((Additive) => {
            //console.log(Additive);
            if (Additive) {
              Datas.AdditiveName = Additive.Additive_Name;
            }

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
                        //res.redirect(`/Printsmlabel/${Datas.FileNo}`)
                        StoreRefImage(State.Data)
                        res.redirect(`/BulkOrders/${Datas.FileNo}`)
                        // res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                      })
                    })
                  } else {
                    Datas.Binder1Name = Binder1.Binder_Name;
                    // res .send data
                    employeeHelpers.SaveFormulaData(Datas).then((State) => {
                      //res.redirect(`/Printsmlabel/${Datas.FileNo}`)
                      StoreRefImage(State.Data)
                      res.redirect(`/BulkOrders/${Datas.FileNo}`)
                      //res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                    })
                  }
                })
              } else {
                // res .send data
                // console.log(Datas);
                employeeHelpers.SaveFormulaData(Datas).then((State) => {
                  //res.redirect(`/Printsmlabel/${Datas.FileNo}`)
                  StoreRefImage(State.Data)
                  res.redirect(`/BulkOrder/${Datas.FileNo}`)
                  //res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                })
              }
            })
            //console.log(Datas);
          })
        }

        CostFindingAndRemainigTasks(Datas);
      })

    })
  })
})

router.post('/getCostingWithData', EmployeeVerifyLogin, (req, res) => {

  // Assuming you have required the necessary modules and set up the server

  // Extract data from the request body
  var ProductIdsArray = req.body.ProductsIdsArray;
  var Binder1 = req.body.Binder1;
  var Binder2 = req.body.Binder2;
  var Additive = req.body.Additives;

  // An object to store the response data that will be sent back to the client
  var ResponseToApi = {};

  // An array to store all the promises
  var promises = [];

  // Fetch products by their IDs and add them to the response object
  var promise4 = employeeHelpers.GetProductByArrayOfProductById(ProductIdsArray).then((Products) => {
    // console.log("Products: ", Products);
    ResponseToApi.Products = Products;
  });
  promises.push(promise4);

  // Check if Binder1 is provided and fetch the binder by its name
  if (Binder1) {
    var promise1 = employeeHelpers.getBinderByName(Binder1).then((Binder1s) => {
      // console.log("Binder1s: ", Binder1s);
      ResponseToApi.Binder1 = Binder1s;
    });
    promises.push(promise1);
  }

  // Check if Binder2 is provided and fetch the binder by its name
  if (Binder2) {
    var promise2 = employeeHelpers.getBinderByName(Binder2).then((Binder2s) => {
      // console.log("Binder2s: ", Binder2s);
      ResponseToApi.Binder2 = Binder2s;
    });
    promises.push(promise2);
  }

  // Check if Additive is provided and fetch the additives by their ID
  if (Additive) {
    var promise3 = employeeHelpers.getAdditivesById(Additive).then((Additives) => {
      // console.log("Additives: ", Additives);
      ResponseToApi.Additive = Additives;
    });
    promises.push(promise3);
  }

  // Wait for all promises to resolve using Promise.all()
  Promise.all(promises)
    .then(() => {
      // All promises have resolved
      // Send the complete response object back to the client
      res.json(ResponseToApi);
    })
    .catch((error) => {
      // Handle any errors that occurred during the promise executions
      console.error("Error:", error);
      // Send a 500 status with an error response
      res.status(500).json({ error: "An error occurred" });
    });

})

router.get('/FormulaList', EmployeeVerifyLogin, (req, res) => {
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

router.get('/BulkOrders/:FileNo/:Qty', EmployeeVerifyLogin, (req, res) => {
  var FileNo = req.params.FileNo;
  var QTY = req.params.Qty;
  //employeeHelpers.AddStocksToBinders()


  // no query , 
  employeeHelpers.FindFormulaByFileNo(FileNo).then((Formulation) => {
    //console.log(Formulation);
    var Binder1 = false;
    var Binder2 = false;
    var MattOrGloss = false;
    var MattOrGlossValue = false;


    if (Formulation.Binder1) {
      Binder1 = true;
    }
    if (Formulation.Binder2) {
      Binder2 = true;
    }

    if (Formulation.gloss) {
      MattOrGloss = "Gloss"
      MattOrGlossValue = Formulation.gloss
    } else if (Formulation.matt) {
      MattOrGloss = "Matt"
      MattOrGlossValue = Formulation.matt
    }


    var Liter = false;
    employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
      if (Sub_Category.Liter) {
        Liter = true
      }
      res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, MattOrGlossValue, MattOrGloss, QTY });
    })
  })

})

router.get('/BulkOrders/:FileNo', EmployeeVerifyLogin, (req, res) => {
  var FileNo = req.params.FileNo;

  //employeeHelpers.AddStocksToBinders()

  // Extract the query parameters
  var { Stock, Item, TotalQTY } = req.query;

  var { NoQty } = req.query;

  if (NoQty) {
    // No qty
    employeeHelpers.FindFormulaByFileNo(FileNo).then((Formulation) => {
      // console.log(Formulation);

      var Binder1 = false;
      var Binder2 = false;
      var MattOrGloss = false;
      var MattOrGlossValue = false;

      if (Formulation.Binder1) {
        Binder1 = true;
      }
      if (Formulation.Binder2) {
        Binder2 = true;
      }

      if (Formulation.gloss) {
        MattOrGloss = "Gloss"
        MattOrGlossValue = Formulation.gloss
      } else if (Formulation.matt) {
        MattOrGloss = "Matt"
        MattOrGlossValue = Formulation.matt
      }

      // console.log("MattOrGloss: ", MattOrGloss);


      var Liter = false;
      employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
        if (Sub_Category.Liter) {
          Liter = true
        }
        NoQty = "minimum Quantity is 1";
        res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, Item, MattOrGlossValue, MattOrGloss, NoQty });
      })
    })
  } else {

    // console.log("Stock: ", Stock, " Item : ", Item, " TotalQTY: ", TotalQTY);

    if (Stock) {
      // low stocks
      employeeHelpers.FindFormulaByFileNo(FileNo).then((Formulation) => {
        // console.log(Formulation);

        var Binder1 = false;
        var Binder2 = false;
        var MattOrGloss = false;
        var MattOrGlossValue = false;

        if (Formulation.Binder1) {
          Binder1 = true;
        }
        if (Formulation.Binder2) {
          Binder2 = true;
        }

        if (Formulation.gloss) {
          MattOrGloss = "Gloss"
          MattOrGlossValue = Formulation.gloss
        } else if (Formulation.matt) {
          MattOrGloss = "Matt"
          MattOrGlossValue = Formulation.matt
        }

        // console.log("MattOrGloss: ", MattOrGloss);


        var Liter = false;
        employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
          if (Sub_Category.Liter) {
            Liter = true
          }

          res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, TotalQTY, Item, MattOrGlossValue, MattOrGloss });
        })
      })

    } else {
      // no query , 
      employeeHelpers.FindFormulaByFileNo(FileNo).then((Formulation) => {
        // console.log(Formulation);

        var Binder1 = false;
        var Binder2 = false;
        var MattOrGloss = false;
        var MattOrGlossValue = false;

        if (Formulation.Binder1) {
          Binder1 = true;
        }
        if (Formulation.Binder2) {
          Binder2 = true;
        }

        if (Formulation.gloss) {
          MattOrGloss = "Gloss"
          MattOrGlossValue = Formulation.gloss
        } else if (Formulation.matt) {
          MattOrGloss = "Matt"
          MattOrGlossValue = Formulation.matt
        }

        var Liter = false;
        employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
          if (Sub_Category.Liter) {
            Liter = true
          }
          res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, MattOrGlossValue, MattOrGloss });
        })
      })
    }
  }
})

router.get('/api/BulkOrder/:FileNo', (req, res) => {
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

      if (req.session.CustomerLogged) {
        Data.Customer = req.session.CustomerData;
      }
      // console.log("Stating to execute!");
      // console.log(Data);

      res.json(Data);

    })

  })
})

router.post('/BulkOrder/:id', EmployeeVerifyLogin, async (req, res) => {
  var OrderFile = req.body;
  let id = req.params.id;
  var TotalQty = OrderFile.Quantity;
  var LowStockFlag = {
    Status: false
  };

  if (parseFloat(TotalQty) <= 0) {
    var url = `/BulkOrders/${id}?NoQty=${TotalQty}`;
    res.redirect(url);
  } else {

    try {
      let FormulaFile = await employeeHelpers.GetFormulaByFileNo(id);
      let TinterCount = parseInt(FormulaFile.TintersCount);

      OrderFile.TinterCount = TinterCount;

      let promises = [];

      for (let i = 1; i <= TinterCount; i++) {
        var TinterName = OrderFile["TineterName" + i];
        var TinterQty = OrderFile["TinterGram" + i];
        //  console.log("Tinter Name : " + TinterName + " Qty : " + TinterQty);

        promises.push(employeeHelpers.TinterCheckStock(TinterName, TinterQty));
      }

      let states = await Promise.all(promises);

      for (let i = 0; i < states.length; i++) {
        let State = states[i];
        //  console.log(State);
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
          // console.log(" Binder1 Stocks are not available. ");
          LowStockFlag.Status = true;
          return; // Exit the loop when there is low stock
        }
        if (OrderFile.Binder2) {
          var Binder2Qty = OrderFile.Binder2QTY;
          let binder2State = await employeeHelpers.BinderCheckStock(OrderFile.Binder2, Binder2Qty);
          if (!binder2State.HaveStock) {
            LowStocks(OrderFile.Binder2, TotalQty);
            //  console.log(" Binder2 Stocks are not available. ");
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
          // console.log(" Additive Stocks are not available. ");
          LowStockFlag.Status = true;
          return; // Exit the loop when there is low stock
        }
      }

      // console.log(" Tinter Stocks are available. ");

    } catch (error) {
      console.error(error);
    }

    if (!LowStockFlag.Status) {
      BulkOrderNow(OrderFile);
    }

    function BulkOrderNow(orderFile) {
      employeeHelpers.BulkOrderUpdate(orderFile).then(() => {
        // Rest of the code...
        //  console.log("Bulk Updated!");
        trelloHelpers.addTrelloCard(orderFile).then((CardId) => {
          employeeHelpers.SaveCardIDToOrder(orderFile.FileName, CardId).then(() => {
            res.redirect('/Orders');
          })
        })
      });
    }

    function LowStocks(tinterName, TotalQty) {
      var FileNo = id;
      var stockQuery = "low";
      var itemQuery = tinterName;
      var TotalQTY = TotalQty;

      var url = `/BulkOrders/${FileNo}?Stock=${stockQuery}&Item=${itemQuery}&TotalQTY=${TotalQTY}`;
      res.redirect(url);
    }
  }
});

router.get('/UpdateStocks', EmployeeVerifyLogin, (req, res) => {
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

router.post('/UpdateProductStock/:id', EmployeeVerifyLogin, (req, res) => {
  var Data = req.body;
  Data.ProductId = req.params.id;
  //console.log(Data);
  employeeHelpers.UpdateProductStockById(Data).then(() => {
    res.redirect('/UpdateStocks');
  })

})

router.get('/BinderStockUpdate', EmployeeVerifyLogin, (req, res) => {
  employeeHelpers.GetAllBinders().then((Binders) => {
    res.render('employee/BinderStockUpdate', { Binders });
  })
})

router.post('/UpdateBinderStock/:id', EmployeeVerifyLogin, (req, res) => {
  var Data = req.body;
  Data.ProductId = req.params.id;
  // console.log(Data);
  employeeHelpers.UpdateBinderStockById(Data).then(() => {
    res.redirect('/BinderStockUpdate');
  })
})

router.get('/AdditiveStockUpdate', EmployeeVerifyLogin, (req, res) => {
  employeeHelpers.GetAllAdditives().then((Additives) => {
    res.render('employee/AdditiveStockUpdate', { Additives });
  })
})


router.post('/UpdateAdditiveStock/:id', EmployeeVerifyLogin, (req, res) => {
  var Data = req.body;
  Data.ProductId = req.params.id;
  // console.log(Data);
  employeeHelpers.UpdateAdditiveStockById(Data).then(() => {
    res.redirect('/AdditiveStockUpdate');
  })
})

router.get('/Orders', EmployeeVerifyLogin, (req, res) => {
  employeeHelpers.GetAllOrderList().then((Orders) => {
    res.render('employee/Orders', { Orders })
  })
})

router.get('/Printsmlabel/:fileNo', EmployeeVerifyLogin, (req, res) => {
  //console.log(req.params.fileNo);
  var FileNo = req.params.fileNo;
  employeeHelpers.GetFormulaByFileNo(FileNo).then((Formula) => {
    var Print = true;
    employeeHelpers.GetSubCategoriesByName(Formula.SubCategoryName).then((SubCategory) => {

      var SC = Formula;
      SC.SolidContent = parseFloat(SC.SolidContent).toFixed(2)

      SC.Density = parseFloat(SC.Density).toFixed(2)

      SC.VOC = parseFloat(SC.VOC).toFixed(2)

      var Mipa = false;
      if (SubCategory.Mipa) {
        Mipa = true;
      }
      res.render('employee/SmallLabel', { Formula, Print, Mipa });
      //res.redirect(`/BulkOrder/${FileNo}`)
    })
  })
})

router.get('/EditFormula/:fileNo', EmployeeVerifyLogin, (req, res) => {
  var FileNo = req.params.fileNo;
  employeeHelpers.GetFormulaByFileNo(FileNo).then((Formula) => {
    // console.log(Formula);
    // Formula.mattOrGloss = parseInt(Formula.mattOrGloss);
    var Matt = false;
    var Gloss = false;

    if (!isNaN(Formula.matt)) {
      Matt = parseInt(Formula.matt);
    } else if (!isNaN(Formula.gloss)) {
      Gloss = parseInt(Formula.gloss);
    }

    employeeHelpers.getAllCategories().then((AllCategory) => {
      // console.log(AllCategory);

      const formulaCategory = Formula.CategoryName; // 'Paints' in this example
      let reorderedAllCategory = [];

      // First, find the object that matches the formula category
      const matchingCategory = AllCategory.find(category => category.Category === formulaCategory);

      // Remove the matching category from AllCategory if it exists
      if (matchingCategory) {
        reorderedAllCategory = AllCategory.filter(category => category.Category !== formulaCategory);

        // Add it to the beginning of the reorderedAllCategory array
        reorderedAllCategory.unshift(matchingCategory);
      } else {
        reorderedAllCategory = [...AllCategory];
      }

      var MatchingCategoryID = matchingCategory.Category_Id;
      employeeHelpers.GetAllSubCategoriesByMatchingCategory(MatchingCategoryID).then((AllSubCategories) => {
        // console.log("AllSubCategories: ",AllSubCategories);

        const formulaSubcategory = Formula.SubCategoryName;
        let reOrderedSubcategories = [];

        const MatchingSubCategory = AllSubCategories.find(Subcategory => Subcategory.SubCategory === formulaSubcategory);

        if (MatchingSubCategory) {
          reOrderedSubcategories = AllSubCategories.filter(Subcategory => Subcategory.SubCategory !== formulaSubcategory)

          reOrderedSubcategories.unshift(MatchingSubCategory);
          // console.log("Has Matching Sub category")
        } else {
          // console.log("not Matching Sub category")
          reOrderedSubcategories = [...AllSubCategories];
        }

        employeeHelpers.GetAllAdditives().then((Additives) => {
          console.log("Additives:", Additives);
          // Find the index of the Additive with AdditiveName: 'Multi-Mat'
          const indexToMove = Additives.findIndex(additive => additive.Additive_Name === 'Multi-Mat');

          // If 'Multi-Mat' is found, move it to the beginning of the array
          if (indexToMove !== -1) {
            const movedAdditive = Additives.splice(indexToMove, 1)[0]; // Remove and store the found additive
            Additives.unshift(movedAdditive); // Add it to the beginning of the array
          }

          employeeHelpers.GetAllTinteresByFormula(Formula).then((Tinters) => {
            console.log(Tinters);

            res.render('employee/EditFormula', { Formula, Categories: reorderedAllCategory, Subcategories: reOrderedSubcategories, Matt, Gloss, Tinters, Additives });

          })
        })
      })

    })
  })
})

router.post('/CreateEditedFormula', EmployeeVerifyLogin, (req, res) => {
  console.log(req.body);

  function StoreRefImage(SavedData) {
    if (req.files) {
      const imageData = req.files.Image;
      // console.log('Image data:', imageData);

      imageData.mv('./public/images/RefImages/' + SavedData.FileNo + ".jpg", (err) => {
        if (!err) {
        } else {
          console.log("Error at img1 " + err)
        }
      })
    }
  }

  // console.log(req.body);
  function calculateRatios(data) {
    // console.log("Calculating Data: ", data);
    const ratios = {};

    // Get the Total Quantity
    const totalQty = parseFloat(data.TotalQtyInGram);

    // Calculate the ratios
    ratios.totalQty = 1;
    ratios.additive = totalQty !== 0 ? parseFloat(data.TotalAdditives) / totalQty : 0;
    ratios.binder1 = totalQty !== 0 ? parseFloat(data.Binder1) / totalQty : 0;
    ratios.binder2 = totalQty !== 0 ? parseFloat(data.Binder2 || 0) / totalQty : 0;
    // calculate VOLUME Ratio
    const TotalVolume = parseFloat(data.TotalQtyInLiter);
    //console.log("TotalVolume", TotalVolume);

    ratios.totalVolume = 1;
    ratios.additiveVolume = TotalVolume !== 0 ? parseFloat(data.TotalAdditivesVolume) / TotalVolume : 0;
    ratios.binder1Volume = TotalVolume !== 0 ? parseFloat(data.Binder1Volume) / TotalVolume : 0;
    ratios.binder2Volume = TotalVolume !== 0 ? parseFloat(data.Binder2Volume || 0) / TotalVolume : 0;

    ratios.tinters = {};
    const tinterKeys = Object.keys(data).filter(key => key.startsWith('GramInputTotalR'));
    const tinterCount = tinterKeys.length;
    const tinterSum = tinterKeys.reduce((sum, key) => sum + parseFloat(data[key] || 0), 0);
    tinterKeys.forEach((key, index) => {
      const tinterNo = key.slice(15);
      ratios.tinters[tinterNo] = totalQty !== 0 ? (parseFloat(data[key]) || 0) / totalQty : 0;
    });

    ratios.tintersVolume = {};
    const tinterVolumeKeys = Object.keys(data).filter(key => key.startsWith('LiterInputTotalR'));
    const tinterVolumeCount = tinterVolumeKeys.length;
    const tinterVolumeSum = tinterVolumeKeys.reduce((sum, key) => sum + parseFloat(data[key] || 0), 0);
    tinterVolumeKeys.forEach((key, index) => {
      const tinterNo = key.slice(15);
      ratios.tintersVolume[tinterNo] = TotalVolume !== 0 ? (parseFloat(data[key]) || 0) / TotalVolume : 0;
    });

    return ratios;
  }

  async function CalculateCostOfAll(ReqData) {
    var TintersCount = ReqData.TintersRatioArray.length;

    // Find Product Price and Unit
    const productPromises = []; // Array to store promises

    for (let i = 1; i <= TintersCount; i++) {
      // Dynamically access the variable using bracket notation
      let TintervariableName = `TintersR${i}`;
      let TinterPriceVariable = `TinterPriceR${i}`;
      let TinterPriceUnitVariable = `TinterPriceUnit${i}`;
      let TinterDensityCount = `TinterDensity${i}`;

      console.log("ReqData:", ReqData)

      var Tinter = ReqData[TintervariableName];

      // Store the promise in the array
      const productPromise = employeeHelpers.getProductByName(Tinter).then((Product) => {
        console.log(Product)
        ReqData[TinterPriceVariable] = Product.Price;
        ReqData[TinterPriceUnitVariable] = Product.PriceUnit;
        ReqData[TinterDensityCount] = Product.Product_Density;
      });

      productPromises.push(productPromise); // Add promise to the array
      // console.log(ReqData[TintervariableName]);
    }

    // Wait for all the getProductByName promises to complete before proceeding
    await Promise.all(productPromises);

    // console.log("ReqData: ", ReqData);

    // Find Binder Price unit
    if (ReqData.Binder1Ratio) {
      await employeeHelpers.GetSubcategotyByName(ReqData.SubCategoryName).then(async (SubCategory) => {
        var Binder1ID = SubCategory.Binder1
        await employeeHelpers.GetBinderById(Binder1ID).then((Binder1) => {
          if (Binder1) {
            ReqData.Binder1Price = Binder1.cost;
            ReqData.Binder1PriceUnit = Binder1.PriceUnit;
            ReqData.Binder1_Density = Binder1.Binder_Density;
          }
        })
        if (ReqData.Binder2Ratio) {
          const Binder2ID = SubCategory.Binder2;
          const Binder2 = await employeeHelpers.GetBinderById(Binder2ID);
          if (Binder2) {
            ReqData.Binder2Price = Binder2.cost;
            ReqData.Binder2PriceUnit = Binder2.PriceUnit;
            ReqData.Binder2_Density = Binder2.Binder_Density;
          }
        }

      })
    }

    // Find Additive Price and unit
    if (ReqData.AdditiveRatio) {
      var AdditiveID = ReqData.additives;
      await employeeHelpers.getAdditivesById(AdditiveID).then((Additive) => {
        ReqData.AdditivePrice = Additive.cost;
        ReqData.AdditivePriceUnit = Additive.PriceUnit;
        ReqData.Additive_Density = Additive.Additive_Density;
      });
    }

    // console.log("ReqData: ", ReqData);

    return ReqData;

  }


  var Datas = req.body;

  // console.log("Req.body datas: ", Datas)


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

  const result = calculateRatios(Datas);
  // console.log('Total Quantity:', result.totalQty);
  // console.log('Additive Ratio:', result.additive);
  // console.log('Binder1 Ratio:', result.binder1);
  // console.log('Binder2 Ratio:', result.binder2);
  // console.log('Tinters Ratios:', result.tinters);
  Datas.AdditiveRatio = result.additive;
  Datas.Binder1Ratio = result.binder1;
  Datas.Binder2Ratio = result.binder2;
  Datas.AdditiveVolumeRatio = result.additiveVolume;
  Datas.Binder1VolumeRatio = result.binder1Volume;
  Datas.Binder2VolumeRatio = result.binder2Volume;
  Datas.TintersRatioObject = result.tinters;
  Datas.TintersVolumeRatioObject = result.tintersVolume;

  // console.log("Tinters Ratio: ", result.tinters);
  for (var key in result.tinters) {
    if (result.tinters[key] === 0) {
      delete result.tinters[key];
    }
  }
  // console.log("Tinters Ratio: ", result.tinters);
  Datas.TintersRatioArray = Object.values(result.tinters);
  Datas.TintersVolumeRatioArray = Object.values(result.tintersVolume);

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

        // console.log(Datas);
        async function CostFindingAndRemainigTasks(Datas) {
          Datas = await CalculateCostOfAll(Datas);
          // console.log("REERE", Datas);


          employeeHelpers.FindAdditiveById(Datas.additives).then((Additive) => {
            //console.log(Additive);
            if (Additive) {
              Datas.AdditiveName = Additive.Additive_Name;
            }

            employeeHelpers.GetSubCategoriesById(Datas.SubCategory).then((SubCategory) => {
              //console.log(SubCategory)
              // create tintername key.
              var tinterCount = parseInt(Datas.TintersCount);
              for (i = 1; i <= tinterCount; i++) {
                Datas[`TinterNameR${i}`] = Datas[`TintersR${i}`];
              }

              if (SubCategory.Binder1) {
                employeeHelpers.getBinderById(SubCategory.Binder1).then((Binder1) => {
                  //console.log("Binder1: ", Binder1)
                  if (SubCategory.Binder2) {
                    employeeHelpers.getBinderById(SubCategory.Binder2).then((Binder2) => {
                      // console.log("Binder2: ", Binder2)
                      Datas.Binder1Name = Binder1.Binder_Name;
                      Datas.Binder2Name = Binder2.Binder_Name;
                      // res .send data
                      employeeHelpers.SaveEditedFormulaData(Datas).then((State) => {
                        //res.redirect(`/Printsmlabel/${Datas.FileNo}`)
                        StoreRefImage(State.Data)
                        res.redirect(`/UpdatedBulkOrders/${Datas.FileNo}`)
                        // res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                      })
                    })
                  } else {
                    Datas.Binder1Name = Binder1.Binder_Name;
                    // res .send data
                    employeeHelpers.SaveEditedFormulaData(Datas).then((State) => {
                      //res.redirect(`/Printsmlabel/${Datas.FileNo}`)
                      StoreRefImage(State.Data)
                      res.redirect(`/UpdatedBulkOrders/${Datas.FileNo}`)
                      //res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                    })
                  }
                })
              } else {
                // res .send data
                employeeHelpers.SaveEditedFormulaData(Datas).then((State) => {
                  //res.redirect(`/Printsmlabel/${Datas.FileNo}`)
                  StoreRefImage(State.Data)
                  res.redirect(`/UpdatedBulkOrders/${Datas.FileNo}`)
                  //res.render('employee/AfterFormulaCreation', { Datas, TintersRatioObject: Datas.TintersRatioObject, TintersCount: Datas.TintersCount });
                })
              }
            })
            //console.log(Datas);
          })
        }

        CostFindingAndRemainigTasks(Datas);
      })

    })
  })
})

router.get('/UpdatedBulkOrders/:FileNo', EmployeeVerifyLogin, (req, res) => {
  var FileNo = req.params.FileNo;

  //employeeHelpers.AddStocksToBinders()

  // Extract the query parameters
  var { Stock, Item, TotalQTY } = req.query;

  var { NoQty } = req.query;

  if (NoQty) {
    // No qty
    employeeHelpers.FindUpdatesFormulaByFileNo(FileNo).then((Formulation) => {
      // console.log(Formulation);

      var Binder1 = false;
      var Binder2 = false;
      var MattOrGloss = false;
      var MattOrGlossValue = false;

      if (Formulation.Binder1) {
        Binder1 = true;
      }
      if (Formulation.Binder2) {
        Binder2 = true;
      }

      if (Formulation.gloss) {
        MattOrGloss = "Gloss"
        MattOrGlossValue = Formulation.gloss
      } else if (Formulation.matt) {
        MattOrGloss = "Matt"
        MattOrGlossValue = Formulation.matt
      }

      // console.log("MattOrGloss: ", MattOrGloss);


      var Liter = false;
      employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
        if (Sub_Category.Liter) {
          Liter = true
        }
        NoQty = "minimum Quantity is 1";
        res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, Item, MattOrGlossValue, MattOrGloss, NoQty, UpdateOrder: true });
      })
    })
  } else {

    // console.log("Stock: ", Stock, " Item : ", Item, " TotalQTY: ", TotalQTY);

    if (Stock) {
      // low stocks
      employeeHelpers.FindUpdatesFormulaByFileNo(FileNo).then((Formulation) => {
        // console.log(Formulation);

        var Binder1 = false;
        var Binder2 = false;
        var MattOrGloss = false;
        var MattOrGlossValue = false;

        if (Formulation.Binder1) {
          Binder1 = true;
        }
        if (Formulation.Binder2) {
          Binder2 = true;
        }

        if (Formulation.gloss) {
          MattOrGloss = "Gloss"
          MattOrGlossValue = Formulation.gloss
        } else if (Formulation.matt) {
          MattOrGloss = "Matt"
          MattOrGlossValue = Formulation.matt
        }

        // console.log("MattOrGloss: ", MattOrGloss);


        var Liter = false;
        employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
          if (Sub_Category.Liter) {
            Liter = true
          }

          res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, TotalQTY, Item, MattOrGlossValue, MattOrGloss, UpdateOrder: true });
        })
      })

    } else {
      // no query , 
      employeeHelpers.FindUpdatesFormulaByFileNo(FileNo).then((Formulation) => {
        // console.log(Formulation);

        var Binder1 = false;
        var Binder2 = false;
        var MattOrGloss = false;
        var MattOrGlossValue = false;

        if (Formulation.Binder1) {
          Binder1 = true;
        }
        if (Formulation.Binder2) {
          Binder2 = true;
        }

        if (Formulation.gloss) {
          MattOrGloss = "Gloss"
          MattOrGlossValue = Formulation.gloss
        } else if (Formulation.matt) {
          MattOrGloss = "Matt"
          MattOrGlossValue = Formulation.matt
        }

        var Liter = false;
        employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
          if (Sub_Category.Liter) {
            Liter = true
          }
          res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, MattOrGlossValue, MattOrGloss, UpdateOrder: true });
        })
      })
    }
  }
})

router.get('/api/BulkOrder/Updated/:FileNo', (req, res) => {
  var FileNo = req.params.FileNo;
  employeeHelpers.FindUpdatesFormulaByFileNo(FileNo).then((Formulation) => {
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

      if (req.session.CustomerLogged) {
        Data.Customer = req.session.CustomerData;
      }
      // console.log("Stating to execute!");
      console.log(Data);

      res.json(Data);

    })

  })
})

router.post('/UpdatedBulkOrder/:id', EmployeeVerifyLogin, async (req, res) => {
  var OrderFile = req.body;
  let id = req.params.id;
  var TotalQty = OrderFile.Quantity;
  var LowStockFlag = {
    Status: false
  };

  if (parseFloat(TotalQty) <= 0) {
    var url = `/UpdatedBulkOrders/${id}?NoQty=${TotalQty}`;
    res.redirect(url);
  } else {

    try {
      let FormulaFile = await employeeHelpers.GetUpdatesFormulaByFileNo(id);
      let TinterCount = parseInt(FormulaFile.TintersCount);

      OrderFile.TinterCount = TinterCount;

      let promises = [];

      for (let i = 1; i <= TinterCount; i++) {
        var TinterName = OrderFile["TineterName" + i];
        var TinterQty = OrderFile["TinterGram" + i];
        //  console.log("Tinter Name : " + TinterName + " Qty : " + TinterQty);

        promises.push(employeeHelpers.TinterCheckStock(TinterName, TinterQty));
      }

      let states = await Promise.all(promises);

      for (let i = 0; i < states.length; i++) {
        let State = states[i];
        //  console.log(State);
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
          // console.log(" Binder1 Stocks are not available. ");
          LowStockFlag.Status = true;
          return; // Exit the loop when there is low stock
        }
        if (OrderFile.Binder2) {
          var Binder2Qty = OrderFile.Binder2QTY;
          let binder2State = await employeeHelpers.BinderCheckStock(OrderFile.Binder2, Binder2Qty);
          if (!binder2State.HaveStock) {
            LowStocks(OrderFile.Binder2, TotalQty);
            //  console.log(" Binder2 Stocks are not available. ");
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
          // console.log(" Additive Stocks are not available. ");
          LowStockFlag.Status = true;
          return; // Exit the loop when there is low stock
        }
      }

      // console.log(" Tinter Stocks are available. ");

    } catch (error) {
      console.error(error);
    }

    if (!LowStockFlag.Status) {
      BulkOrderNow(OrderFile);
    }

    function BulkOrderNow(orderFile) {
      orderFile.isUpdated = true;
      employeeHelpers.BulkOrderUpdate(orderFile).then(() => {
        // Rest of the code...
        //  console.log("Bulk Updated!");
        trelloHelpers.addTrelloCard(orderFile).then((CardId) => {
          employeeHelpers.SaveCardIDToOrder(orderFile.FileName, CardId).then(() => {
            res.redirect('/Orders');
          })
          // res.redirect('/Orders');
        })
      });
    }

    function LowStocks(tinterName, TotalQty) {
      var FileNo = id;
      var stockQuery = "low";
      var itemQuery = tinterName;
      var TotalQTY = TotalQty;

      var url = `/UpdatedBulkOrders/${FileNo}?Stock=${stockQuery}&Item=${itemQuery}&TotalQTY=${TotalQTY}`;
      res.redirect(url);
    }
  }
});

router.get('/UpdatedEditFormula/:fileNo', EmployeeVerifyLogin, (req, res) => {
  var FileNo = req.params.fileNo;
  employeeHelpers.GetUpdatesFormulaByFileNo(FileNo).then((Formula) => {
    // console.log(Formula);
    // Formula.mattOrGloss = parseInt(Formula.mattOrGloss);
    var Matt = false;
    var Gloss = false;

    if (!isNaN(Formula.matt)) {
      Matt = parseInt(Formula.matt);
    } else if (!isNaN(Formula.gloss)) {
      Gloss = parseInt(Formula.gloss);
    }

    employeeHelpers.getAllCategories().then((AllCategory) => {
      // console.log(AllCategory);

      const formulaCategory = Formula.CategoryName; // 'Paints' in this example
      let reorderedAllCategory = [];

      // First, find the object that matches the formula category
      const matchingCategory = AllCategory.find(category => category.Category === formulaCategory);

      // Remove the matching category from AllCategory if it exists
      if (matchingCategory) {
        reorderedAllCategory = AllCategory.filter(category => category.Category !== formulaCategory);

        // Add it to the beginning of the reorderedAllCategory array
        reorderedAllCategory.unshift(matchingCategory);
      } else {
        reorderedAllCategory = [...AllCategory];
      }

      var MatchingCategoryID = matchingCategory.Category_Id;
      employeeHelpers.GetAllSubCategoriesByMatchingCategory(MatchingCategoryID).then((AllSubCategories) => {
        // console.log("AllSubCategories: ",AllSubCategories);

        const formulaSubcategory = Formula.SubCategoryName;
        let reOrderedSubcategories = [];

        const MatchingSubCategory = AllSubCategories.find(Subcategory => Subcategory.SubCategory === formulaSubcategory);

        if (MatchingSubCategory) {
          reOrderedSubcategories = AllSubCategories.filter(Subcategory => Subcategory.SubCategory !== formulaSubcategory)

          reOrderedSubcategories.unshift(MatchingSubCategory);
          // console.log("Has Matching Sub category")
        } else {
          // console.log("not Matching Sub category")
          reOrderedSubcategories = [...AllSubCategories];
        }

        employeeHelpers.GetAllAdditives().then((Additives) => {
          console.log("Additives:", Additives);
          // Find the index of the Additive with AdditiveName: 'Multi-Mat'
          const indexToMove = Additives.findIndex(additive => additive.Additive_Name === 'Multi-Mat');

          // If 'Multi-Mat' is found, move it to the beginning of the array
          if (indexToMove !== -1) {
            const movedAdditive = Additives.splice(indexToMove, 1)[0]; // Remove and store the found additive
            Additives.unshift(movedAdditive); // Add it to the beginning of the array
          }

          employeeHelpers.GetAllTinteresByFormula(Formula).then((Tinters) => {
            console.log(Tinters);

            res.render('employee/EditFormula', { Formula, Categories: reorderedAllCategory, Subcategories: reOrderedSubcategories, Matt, Gloss, Tinters, Additives, UpdatedOrder: true });

          })
        })
      })

    })
  })
})

router.get('/UpdatedBulkOrders/:FileNo/:Qty', EmployeeVerifyLogin, (req, res) => {
  var FileNo = req.params.FileNo;
  var QTY = req.params.Qty;
  //employeeHelpers.AddStocksToBinders()


  // no query , 
  employeeHelpers.FindUpdatesFormulaByFileNo(FileNo).then((Formulation) => {
    //console.log(Formulation);
    var Binder1 = false;
    var Binder2 = false;
    var MattOrGloss = false;
    var MattOrGlossValue = false;


    if (Formulation.Binder1) {
      Binder1 = true;
    }
    if (Formulation.Binder2) {
      Binder2 = true;
    }

    if (Formulation.gloss) {
      MattOrGloss = "Gloss"
      MattOrGlossValue = Formulation.gloss
    } else if (Formulation.matt) {
      MattOrGloss = "Matt"
      MattOrGlossValue = Formulation.matt
    }


    var Liter = false;
    employeeHelpers.GetSubCategoriesById(Formulation.SubCategory).then((Sub_Category) => {
      if (Sub_Category.Liter) {
        Liter = true
      }
      res.render("employee/BulkOrders", { Formulation, Binder1, Binder2, Liter, MattOrGlossValue, MattOrGloss, QTY, UpdateOrder: true });
    })
  })

})


router.get('/Production', EmployeeVerifyLogin, (req, res) => {
  res.render('employee/Production');
})


router.get('/getAllCardsFromProduction', EmployeeVerifyLogin, async (req, res) => {
  // trelloHelpers.GetAllCardsFromProductionByPersonName(ProductionPersonName).then((Cards) => {
  // })

  try {
    var ProductionPersonName = req.session.EmployeeName;
    var Cards = await trelloHelpers.GetAllCardsFromProductionByPersonName(ProductionPersonName);
    Cards = await trelloHelpers.addImageToCardsInArray(Cards)
    console.log(Cards);


    const allCardDataPromises = Cards.map(async (card) => {
      const cardChecklistIDArray = card.idChecklists;
      console.log("cardChecklistIDArray: ", cardChecklistIDArray[0]);
      if (cardChecklistIDArray[0]) {
        const checkItems = await trelloHelpers.getChecklistFromCheckListID(cardChecklistIDArray[0]);
        card.checkItems = checkItems;
        console.log("Check Items: ", checkItems);
      }
      const ContactDetails = await employeeHelpers.getCardContactDetails(card.id);
      card.ContactDetails = ContactDetails;
      console.log("ContactDetails: ", ContactDetails);
      // const ProductionPeopole = await employeeHelpers.getAllProductionPeople();
      // console.log("Production Peoplae: ", ProductionPeopole);
      // card.ProductionPeople = ProductionPeopole
      return card;
    });

    const AllCards = await Promise.all(allCardDataPromises);


    console.log("AllCard: ", AllCards);
    res.json({ AllCards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

router.post('/cardUpdated/:cardId', EmployeeVerifyLogin, async (req, res) => {
  const checkItems = await trelloHelpers.getChecklistFromCheckListID(req.body.ChecklistID);
  console.log("Card Save ", req.body);
  console.log("checkItems : ", checkItems);

  var CheckListNeedToChange = []

  for (let i = 0; i < checkItems.length; i++) {
    if (req.body[`ChecklistItemCheck${i}`]) {
      if (checkItems[i].state === "complete") {
        // no need to change
      } else {
        // need to change state to "complete"
        var CheckItem = {
          CardId: req.params.cardId,
          CheckId: checkItems[i].id,
          state: "complete"
        }
        CheckListNeedToChange.push(CheckItem);
      }
    } else {
      if (checkItems[i].state === "incomplete") {
        // no need to change
      } else {
        // need to change state to "incomplete"
        var CheckItem = {
          CardId: req.params.cardId,
          CheckId: checkItems[i].id,
          state: "incomplete"
        }
        CheckListNeedToChange.push(CheckItem);
      }
    }
  }

  trelloHelpers.ChangeStateOfCheckItem(CheckListNeedToChange).then(() => {
    res.redirect('/production');
  })
})



router.post('/cardUpdatedReadyforDispatch/:cardId', EmployeeVerifyLogin, async (req, res) => {
  console.log("AllCheckList : ", req.body);
  const checkItems = await trelloHelpers.getChecklistFromCheckListID(req.body.ChecklistID);
  console.log("Card Save ", req.body);
  console.log("checkItems : ", checkItems);

  var CheckListNeedToChange = []

  for (let i = 0; i < checkItems.length; i++) {
    if (req.body[`ChecklistItemCheck${i}`]) {
      if (checkItems[i].state === "complete") {
        // no need to change
      } else {
        // need to change state to "complete"
        var CheckItem = {
          CardId: req.params.cardId,
          CheckId: checkItems[i].id,
          state: "complete"
        }
        CheckListNeedToChange.push(CheckItem);
      }
    } else {
      if (checkItems[i].state === "incomplete") {
        // no need to change
      } else {
        // need to change state to "incomplete"
        var CheckItem = {
          CardId: req.params.cardId,
          CheckId: checkItems[i].id,
          state: "incomplete"
        }
        CheckListNeedToChange.push(CheckItem);
      }
    }
  }

  trelloHelpers.ChangeStateOfCheckItem(CheckListNeedToChange).then(() => {
    // move this card to ready to dispatch
    trelloHelpers.moveCardtoReadyToDispatchByCardID(req.params.cardId).then((response) => {
      res.redirect('/production');

    })
  })
})



module.exports = router;
