var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/adminHelpers');
const trelloHelpers = require('../helpers/trelloHelpers');
const whatsappHelper = require('../helpers/whatsappHelper');
const reader = require('xlsx');
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const { Readable } = require('stream');
const ledgerHelper = require('../helpers/ledgerHelper');
const employeeHelpers = require('../helpers/employeeHelpers');

const AdminUser = {
  userName: "Admin",
  password: "1"
}


// verify login
const verifyLogin = (req, res, next) => {
  if (req.session.AdminLog) {
    next()
  } else {
    res.redirect('/admin/login');
    // next()
  }
}

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  adminHelpers.getCategory().then((AllCategory) => {
    // console.log("Calling Admin Dash")

    // ledgerHelper.doSomeSampleTest().then((data) => {
    //   res.send(data);
    //   // ledgerHelper.doAdvancedSampleTest(data).then((AdvancedData)=>{
    //   // })
    // })

    if (req.query.Error) {
      res.render('admin/Dashboard', { admin: true, AllCategory, AddError: req.query.Error });
    } else if (req.query.DelError) {
      var DelError = req.query.DelError
      res.render('admin/Dashboard', { admin: true, AllCategory, DelError });
    } else {
      res.render('admin/Dashboard', { admin: true, AllCategory });
      // whatsappHelper.sendTestMessage().then(() => {
      // })
      //res.redirect(req.originalUrl.split('?')[0]); // Redirect to the same route without query parameters
    }
  })
});

router.get('/login', (req, res) => {
  res.render('admin/forms/AdminLogin', { admin: true });
})

router.post('/Login', (req, res) => {
  // console.log(req.body);
  adminHelpers.AdminLogin(req.body, AdminUser).then((response) => {
    if (response.Status) {
      //good Login
      req.session.AdminLog = true;
      res.redirect('/admin');
    } else {
      //wrong Login
      res.render('admin/forms/AdminLogin', { admin: true, StateErr: response.err });
    }
  })
})

router.get('/logout', verifyLogin, (req, res) => {
  req.session.AdminLog = false;
  res.redirect("/admin");
})

router.get('/change-password', verifyLogin, (req, res) => {
  res.render('admin/forms/ChangePassword', { admin: true });
})

router.post('/change-password', verifyLogin, (req, res) => {
  //console.log(req.body);
  adminHelpers.AdminPasswordChange(req.body, AdminUser).then((response) => {
    //console.log(response);
    if (response.Status == false) {
      res.render('admin/forms/ChangePassword', { admin: true, StateError: response.err });
    } else {
      res.redirect("/admin");
    }
  })

})

router.post('/addCategory', verifyLogin, (req, res) => {
  // console.log(req.body);
  adminHelpers.AddCategory(req.body).then((State) => {
    // console.log(State)
    if (State.Status) {
      res.redirect('/admin');
    } else {
      res.redirect(`/admin/?Error=${State.error}`);
    }
  })
})

router.get('/Detele-Category/:id', verifyLogin, (req, res) => {
  adminHelpers.DeleteCategory(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin');
    } else {
      res.redirect(`/admin/?DelError=${State.error}`);
    }
  })
})

router.get('/Sub-Category', verifyLogin, (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      // Loop through each subcategory
      for (let i = 0; i < AllSubCategory.length; i++) {
        const subCategory = AllSubCategory[i];
        // Find the matching category
        const category = AllCategory.find(c => c.Category_Id === parseInt(subCategory.Category_Id));
        // Check if a matching category is found
        if (category) {
          subCategory.Category = category.Category;
        } else {
          // Handle the case when no matching category is found
          subCategory.Category = 'Unknown Category';
        }
      }

      adminHelpers.GetAllBinders().then((Binders) => {
        // console.log(Binders)
        res.render('admin/subCategory', { admin: true, AllCategory, AllSubCategory, Binders });
      })
    })
  })
})

router.get('/Subcategories/api', (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      // Loop through each subcategory
      for (let i = 0; i < AllSubCategory.length; i++) {
        const subCategory = AllSubCategory[i];
        // Find the matching category
        const category = AllCategory.find(c => c.Category_Id === parseInt(subCategory.Category_Id));
        // Check if a matching category is found
        if (category) {
          subCategory.Category = category.Category;
        } else {
          // Handle the case when no matching category is found
          subCategory.Category = 'Unknown Category';
        }
      }
      res.json(AllSubCategory)
    })
  })
})

router.get('/addSubCategory', verifyLogin, (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      // Loop through each subcategory
      for (let i = 0; i < AllSubCategory.length; i++) {
        const subCategory = AllSubCategory[i];
        // Find the matching category
        const category = AllCategory.find(c => c.Category_Id === parseInt(subCategory.Category_Id));
        // Check if a matching category is found
        if (category) {
          subCategory.Category = category.Category;
        } else {
          // Handle the case when no matching category is found
          subCategory.Category = 'Unknown Category';
        }
      }

      adminHelpers.GetAllBinders().then((Binders) => {
        //  console.log(Binders)
        res.render('admin/forms/addSubCategory', { admin: true, AllCategory, AllSubCategory, Binders });
      })
    })
  })
})

router.post('/AddSubCategory', verifyLogin, (req, res) => {
  // console.log(req.body)
  adminHelpers.AddSubCategory(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Sub-Category');
    } else {
      res.redirect(`/admin/Sub-Category/?Error=${State.error}`);
    }
  })
})

router.get('/edit-subcategory/:id', verifyLogin, (req, res) => {
  adminHelpers.getSubCategoryById(req.params.id).then((SubCategory) => {
    adminHelpers.getCategory().then((AllCategory) => {
      adminHelpers.GetAllBinders().then((Binders) => {
        // console.log(SubCategory);
        // console.log(AllCategory);
        // console.log(Binders);


        // Find the matching category
        const matchingCategory = AllCategory.find((category) => category.Category_Id === parseInt(SubCategory.Category_Id));

        // Find the matching binder for Binder1
        const matchingBinder1 = Binders.find((binder) => binder.Binder_Id === parseInt(SubCategory.Binder1));

        // Create the array of categories with matching category as the first element
        const matchingCategories = [matchingCategory, ...AllCategory.filter((category) => category.Category_Id !== matchingCategory.Category_Id)];

        // Create the array of binders with matching binder as the first element
        var matchingBinders
        //console.log(matchingBinder1);
        if (matchingBinder1) {
          matchingBinders = [matchingBinder1, ...Binders.filter((binder) => binder.Binder_Id !== matchingBinder1.Binder_Id)];
        }

        // console.log(matchingCategories);
        // console.log(matchingBinders);

        AllCategory = matchingCategories;
        Binders = matchingBinders;

        // console.log(SubCategory);

        var Gram, Liter, Matt, Gloss, Binder2, Mipa, Rosner;

        if (SubCategory.Gram) {
          Gram = true;
        } else if (SubCategory.Liter) {
          Liter = true;
        }

        if (SubCategory.Matt) {
          Matt = true;
        } else if (SubCategory.Gloss) {
          Gloss = true;
        }

        if (SubCategory.Mipa) {
          Mipa = true;
        } else if (SubCategory.Rosner) {
          Rosner = true;
        }



        // console.log(Gram, Liter, Matt, Gloss);

        if (SubCategory.Binder2) {
          Binder2 = SubCategory.Binder2

          let matchingBinder = null;
          const remainingBinders = [];

          for (let i = 0; i < Binders.length; i++) {
            const binder = Binders[i];
            if (binder.Binder_Id.toString() === Binder2) {
              matchingBinder = binder;
            } else {
              remainingBinders.push(binder);
            }
          }

          // Move the matching binder to the first position
          if (matchingBinder !== null) {
            remainingBinders.unshift(matchingBinder);
          }

          // Print the matching binder
          // console.log("Matching Binder:");
          // console.log(matchingBinder);

          // Print the remaining binders
          //  console.log("Remaining Binders:");
          //  console.log(remainingBinders);
          Binder2 = remainingBinders;
          var EditSubcategory = true
          res.render('admin/forms/addSubCategory', { admin: true, EditSubcategory, AllCategory, SubCategory, Binders, Gram, Liter, Matt, Gloss, Binder2, Mipa, Rosner });
        } else {
          var EditSubcategory = true
          res.render('admin/forms/addSubCategory', { admin: true, EditSubcategory, AllCategory, SubCategory, Binders, Gram, Liter, Matt, Gloss, Binder2, Mipa, Rosner });
        }


      })
    })
  })
})


router.post('/EditSubCategory', verifyLogin, (req, res) => {
  // console.log(req.body);
  adminHelpers.EditSubcategoryBy(req.body).then((response) => {
    res.redirect('/admin/Sub-Category');
  })
})

router.get('/Product', verifyLogin, (req, res) => {

  adminHelpers.getCategory().then((AllCategory) => {
    // console.log(AllCategory)
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      adminHelpers.getAllProductGroups().then((AllProductGroup) => {

        // console.log(AllSubCategory)
        adminHelpers.GetAllProduct().then((products) => {
          const filteredSubCategories = AllSubCategory.filter(subCategory => subCategory.Category_Id === '100');
          AllSubCategory = filteredSubCategories;
          if (req.query.Error) {
            const AddError = req.query.Error;
            res.render('admin/product', { admin: true, AllCategory, AllSubCategory, products, AllProductGroup, AddError });
          } else {
            res.render('admin/product', { admin: true, AllCategory, AllSubCategory, products, AllProductGroup });
          }
        })
      })
    })
  })
})

router.get('/GetAllProduct-Cat-Sub/api/:id', (req, res) => {
  var SubCategory_Id = parseInt(req.params.id);
  // adminHelpers.GetProduct(req.params.id).then((products) => {
  adminHelpers.getCategory().then((Category) => {
    adminHelpers.GetAllSubCategory().then((SubCategory) => {
      // console.log("Category = ",Category);
      console.log("SubCategory = ", SubCategory);
      // console.log("Products = ",products)

      const foundSubCategory = SubCategory.find(subCat => subCat.SubCategory_Id === SubCategory_Id);

      // console.log("foundSubCategory.Products = ", foundSubCategory.Products);

      adminHelpers.getAllProductsByArrayOfId(foundSubCategory.Products).then((products) => {
        var data = {
          Category: Category,
          SubCategory: SubCategory,
          Products: products
        }

        res.json(data)
      })
    })
  })
  //})
})

router.get('/GetAllProduct-Cat-Sub/api', (req, res) => {
  adminHelpers.GetAllProduct().then((products) => {
    adminHelpers.getCategory().then((Category) => {
      adminHelpers.GetAllSubCategory().then((SubCategory) => {
        // console.log("Category = ",Category);
        // console.log("SubCategory = ",SubCategory);
        // console.log("Products = ",products)

        var data = {
          Category: Category,
          SubCategory: SubCategory,
          Products: products
        }
        res.json(data)
      })
    })
  })
})

router.get('/addProduct', verifyLogin, (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    // console.log(AllCategory)
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      // console.log(AllSubCategory)
      const filteredSubCategories = AllSubCategory.filter(subCategory => subCategory.Category_Id === '100');
      AllSubCategory = filteredSubCategories;

      adminHelpers.getAllProductGroups().then((AllProductGroups) => {


        adminHelpers.getAllCustomerCategory().then((CustomerCatagory) => {
          res.render('admin/forms/addProducts', { admin: true, AllCategory, AllSubCategory, CustomerCatagory, AllProductGroups });
        })
      })
    })
  })
})

router.post('/addProducts', verifyLogin, (req, res) => {
  // console.log(req.body);
  adminHelpers.addProduct(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Product');
    } else {
      res.redirect(`/admin/Product/?Error=${State.error}`);
    }
  })
})

router.get('/getallcustmercategories/:ProductName', verifyLogin, (req, res) => {
  let ProductName = req.params.ProductName;
  adminHelpers.GetProductByName(ProductName).then(Product => {
    res.json(Product)
  })
})

router.get('/Categories/api', (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    res.json(AllCategory)
  })
})

router.get('/editProduct/:id', verifyLogin, (req, res) => {
  // console.log(req.params.id);
  adminHelpers.GetProductByID(req.params.id).then((product) => {
    adminHelpers.getCategory().then((AllCategory) => {
      adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
        // console.log(product);
        // var CategoryID = product.Category;
        // var SubCategoryID = product.SubCategory

        // var matchingCategory = AllCategory.find((category) => category.Category_Id === parseInt(CategoryID));
        // const NotMatchingCategories = AllCategory.filter(category => category.Category_Id !== parseInt(CategoryID));

        // var matchingSubCategory = AllSubCategory.find((SubCategory) => SubCategory.SubCategory_Id === parseInt(SubCategoryID));
        // const NotMatchingSubCategory = AllSubCategory.filter(SubCategory => SubCategory.SubCategory_Id !== parseInt(SubCategoryID));

        // console.log(product);

        //  PriceUnit: 'Ltr',
        //  StandardQuantityUnit: 'Ltr',

        var PriceUnitLtr = false;
        var STDUnitLtr = false;


        if (product.PriceUnit === 'Ltr') {
          PriceUnitLtr = true;
        }

        if (product.StandardQuantityUnit === 'Ltr') {
          STDUnitLtr = true;
        }

        //StandardQuatity:
        //Stock:

        var RealStock = parseFloat(product.Stock) / parseFloat(product.StandardQuatity);

        adminHelpers.getAllProductGroups().then((AllProductGroups) => {
          console.log("product = ", product);
          console.log("AllProductGroups = ", AllProductGroups);

          // Find the index of the matching element in AllProductGroups
          let matchingIndex = AllProductGroups.findIndex(group => group.GroupName === product.GroupName);

          // Move the matching element to the first position
          if (matchingIndex !== -1) {
            let matchingElement = AllProductGroups.splice(matchingIndex, 1)[0];
            AllProductGroups.unshift(matchingElement);
          }

          res.render('admin/forms/addProducts', { admin: true, editProduct: true, product, PriceUnitLtr, STDUnitLtr, RealStock, AllProductGroups })

        })
      })
    })
  })
})

router.post('/UpdateProducts', verifyLogin, (req, res) => {
  var data = req.body

  adminHelpers.UpdateProduct(data).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Product')
    }
  })
});

router.get('/DeleteProduct/:id', verifyLogin, (req, res) => {
  adminHelpers.DeleteProductById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Product');
    } else {
      res.redirect(`/admin/Product/?Error=${State.error}`);
    }
  })
})

router.get('/copyproduct/:id', verifyLogin, (req, res) => {
  adminHelpers.GetProductByID(req.params.id).then((Product) => {
    adminHelpers.getCategory().then((Category) => {
      //console.log(Category);
      res.render('admin/forms/copyProduct', { admin: true, Product, Category })
    })
  })
})

router.post('/copyproduct/:id', verifyLogin, (req, res) => {
  // console.log(req.params.id);
  adminHelpers.CopyProductById(req.params.id, req.body).then((OPStatus) => {
    if (OPStatus.State) {
      res.redirect('/admin/Product');
    } else {
      adminHelpers.GetProductByID(req.params.id).then((Product) => {
        adminHelpers.getCategory().then((Category) => {
          //console.log(Category);
          var OPError = OPStatus.Error
          res.render('admin/forms/copyProduct', { admin: true, Product, Category, OPError })
        })
      })
    }
  })
})

router.get('/View-Product-from-subcategory/:id', verifyLogin, (req, res) => {
  var SubCategoryId = req.params.id;
  adminHelpers.getSubCategoryById(SubCategoryId).then((SubCategory) => {
    // console.log(SubCategoryId)
     console.log("SubCategory: ",SubCategory)
    var ProductsIdArray = SubCategory.Products;
    // Check if SubCategory.Products is an array and initialize it if not
    if (!Array.isArray(ProductsIdArray)) {
      ProductsIdArray = [];
    }

    adminHelpers.getAllProductsByArrayOfId(ProductsIdArray).then((Products) => {
       console.log(Products);

      Products.forEach(obj => {
        obj.RemoveProductPath = SubCategoryId + '/' + obj.Product_Id;
      });

      res.render('admin/ViewProducts', { admin: true, Products, SubCategory })
    })

  })
})

router.get('/RemoveProduct/:sub/:Product', verifyLogin, (req, res) => {
  var SubCategory_Id = req.params.sub;
  var product_Id = req.params.Product;

  adminHelpers.RemoveProductFromSubcategory(SubCategory_Id, product_Id).then(() => {
    res.redirect(`/admin/View-Product-from-subcategory/${SubCategory_Id}`);
  })
})

router.get('/Additives', verifyLogin, (req, res) => {
  adminHelpers.GetAllAdditives().then((Additives) => {
    res.render('admin/Additives', { admin: true, Additives });
  })
})

router.post('/AddAdditives', verifyLogin, (req, res) => {
  adminHelpers.AddAdditives(req.body).then((State) => {
    // console.log(State)
    if (State.Status) {
      res.redirect('/admin/Additives');
    } else {
      res.redirect(`/admin/Additives/?Error=${State.error}`);
    }
  })
})

router.get('/deleteAdditive/:id', verifyLogin, (req, res) => {
  adminHelpers.DeleteAdditiveById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Additives');
    } else {
      res.redirect(`/admin/Additives/?Error=${State.error}`);
    }
  })
})

router.get('/editAdditive/:id', verifyLogin, (req, res) => {
  adminHelpers.getAdditiveById(req.params.id).then((Additive) => {
    // console.log(Additive);
    var PriceUnitLtr
    if (Additive.PriceUnit === "Ltr") {
      PriceUnitLtr = true;
    }
    res.render('admin/forms/AddAdditives', { editAdditive: true, Additive, PriceUnitLtr, admin: true });
  })
})

router.post('/UpdateAdditives', verifyLogin, (req, res) => {
  adminHelpers.UpdateAdditive(req.body).then(() => {
    res.redirect('/admin/Additives');
  })
})

router.get('/getallcustmercategoriesybyAdditive/:Additive', verifyLogin, (req, res) => {
  adminHelpers.getAdditiveByName(req.params.Additive).then((Additive_Details) => {
    res.json(Additive_Details);
  })
})

router.get('/Binders', verifyLogin, (req, res) => {
  adminHelpers.GetAllBinders().then((Binders) => {
    // console.log(Binders);
    res.render('admin/Binders', { admin: true, Binders });
  })
})

router.post('/AddBinders', verifyLogin, (req, res) => {
  adminHelpers.AddBinders(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Binders');
    } else {
      res.redirect(`/admin/Binders/?Error=${State.error}`);
    }
  })
})

router.get('/deleteBinder/:id', verifyLogin, (req, res) => {
  adminHelpers.DeleteBinderById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Binders');
    } else {
      res.redirect(`/admin/Binders/?Error=${State.error}`);
    }
  })
})

router.get('/editBinder/:id', verifyLogin, (req, res) => {
  adminHelpers.getBinderById(req.params.id).then((Binder) => {
    var PriceUnitLtr = false;
    if (Binder.PriceUnit === 'Ltr') {
      PriceUnitLtr = true;
    }
    res.render('admin/forms/AddBinders', { Binder, admin: true, editBinder: true, PriceUnitLtr });
  })
})

router.get('/getallcustmercategoriesybyBinder/:BinderName', verifyLogin, (req, res) => {
  adminHelpers.GetBinderByname(req.params.BinderName).then((Binder) => {
    res.json(Binder);
  })
})

router.post('/UpdateBinder', verifyLogin, (req, res) => {
  adminHelpers.UpdateBinder(req.body).then((Response) => {
    res.redirect('/admin/Binders');
  })
})

router.get('/Users', verifyLogin, (req, res) => {
  const Error = req.query.Error;
  console.log(Error)

  adminHelpers.getAllUser().then((Users) => {
    adminHelpers.getAllCustomerCategory().then((CustomerCategory) => {
      adminHelpers.GetAllBranches().then((AllBranch) => {
        if (Error) {
          res.render('admin/Users', { admin: true, Users, CustomerCategory, Error, AllBranch });
        } else {
          res.render('admin/Users', { admin: true, Users, CustomerCategory, AllBranch });
        }

      })
    })
  })
})

router.post('/addUser', verifyLogin, (req, res) => {
  // console.log(req.body);

  adminHelpers.AddUser(req.body).then((State) => {
    if (!State.Err) {
      var User = req.body;
      if (User.Designation === "Production" || User.Designation === "Driver") {

        adminHelpers.CreateNewList(User.UserName,User.Branch).then((respone) => {
          res.redirect('/admin/Users');
        })
        // trelloHelpers.AddListForPeople(User.UserName).then(() => {
        // });
      } else {
        res.redirect('/admin/Users');
      }


    } else {
      res.redirect(`/admin/Users?Error=${encodeURIComponent(State.Err)}`);
    }
  })
})

router.get('/editUser/:id', verifyLogin, (req, res) => {
  adminHelpers.getUserByID(req.params.id).then((User) => {
    adminHelpers.GetAllBranches().then((AllBranch) => {
      //console.log("AllBranch= ", AllBranch);
      if (User.Branch) {
        var Branch = User.Branch;
        // Find the index of the branch in AllBranch
        var branchIndex = AllBranch.findIndex(branch => branch.BranchName === Branch);

        // If the branch is found, move it to the first position
        if (branchIndex !== -1) {
          var matchingBranch = AllBranch.splice(branchIndex, 1)[0]; // Remove the matching branch
          AllBranch.unshift(matchingBranch); // Add it to the first position
        }

        console.log(AllBranch);
      }

      adminHelpers.getAllUser().then(AllUsers => {

        // Step 1: Extract unique Designations
        var Designations = ["Customer", "Sales", "Office", "Production", "Dispatcher", "Driver"];


        // Step 2: Remove the selectedUser's Designation
        var indexToRemove = Designations.indexOf(User.Designation);
        if (indexToRemove !== -1) {
          Designations.splice(indexToRemove, 1);
        }

        // Step 3: Prepend the selectedUser's Designation
        Designations.unshift(User.Designation);

        // Designations now contains the list of unique Designations with the selectedUser's Designation at the beginning
        // console.log(Designations);
        console.log(User);

        //     Designation: 'Customer',
        // Category: 'Category 1',

        if (User.Designation === 'Customer') {
          // user is customer
          adminHelpers.getAllCustomerCategory().then(CustomerCategories => {
            var CustomerCategory = User.Category;
            // console.log(CustomerCategories);
            // Find the index of the object with CustomerCategory
            var indexToMove = CustomerCategories.findIndex(function (item) {
              return item.Category === CustomerCategory;
            });

            // If the CustomerCategory is found in the array
            if (indexToMove !== -1) {
              // Remove the object from its current position
              var categoryToMove = CustomerCategories.splice(indexToMove, 1)[0];

              // Add it as the first element in the array
              CustomerCategories.unshift(categoryToMove);
            }

            // Now, AllCustomerCategory has the object with CustomerCategory as the first element
            console.log(CustomerCategories);

            res.render("admin/forms/EditUser", { admin: true, User, Designations, CustomerCategories, AllBranch });
          })
        } else {
          res.render("admin/forms/EditUser", { admin: true, User, Designations, AllBranch });
        }

      })
    })
  })
})

router.get('/getAllUsersAndBranchData/Api', verifyLogin, (req, res) => {
  adminHelpers.getAllUser().then(Users => {
    // console.log(Users);
    adminHelpers.GetAllBranches().then(Branches => {

      res.json({
        Users: Users, 
        Branches: Branches
      });
    })
  })
})

router.post('/UpdateUser/:UserId', verifyLogin, (req, res) => {
  var UserData = req.body;
  UserData.UserID = parseInt(req.params.UserId);
  adminHelpers.updateUser(UserData).then((response) => {
    res.redirect('/admin/Users')
  })

})



router.get('/api/GetSubcategoryByCategoryId/:id', verifyLogin, (req, res) => {
  adminHelpers.getSubCategoryByCategoryId(req.params.id).then((SubCategory) => {
    // console.log("SubCategory = ", SubCategory);
    res.json({ subcategories: SubCategory });
  })
})

router.post('/AddCustomerCategory', verifyLogin, (req, res) => {
  // console.log(req.body);
  adminHelpers.addCustomerCategory(req.body).then((State) => {
    if (State.status) {
      res.redirect('/admin/Users');
    } else {
      res.redirect(`/admin/Users/?Error=${encodeURIComponent(State.Error)}&message=${encodeURIComponent(State.message)}`);
      //Error: 'Already Added!'
    }
  })
})

router.get('/removecustomerCategory/:Category', verifyLogin, (req, res) => {
  adminHelpers.RemoveCustomerCategoryByName(req.params.Category).then((Response) => {
    res.redirect('/admin/Users');
  })
})

router.get('/getallcustmercategories', verifyLogin, (req, res) => {
  adminHelpers.getAllCustomerCategory().then((CustomerCategory) => {
    // console.log(CustomerCategory)
    res.json(CustomerCategory)
  })
})


/* Branches*/

router.get('/Branches', verifyLogin, (req, res) => {
  res.render('admin/Branches', { admin: true });
})

router.post('/addNewBranch', verifyLogin, (req, res) => {
  console.log(req.body);
  adminHelpers.ValidateAndStoreNewBranch(req.body).then((State) => {
    if (State.Error) {
      res.render('admin/Branches', { admin: true, Error: State.Error });
    } else {
      res.redirect('/admin/Branches')
    }
  })
})

router.get('/UsersAndBranches/Api', verifyLogin, (req, res) => {
  adminHelpers.GetAllBranches().then((AllBranches) => {
    console.log(AllBranches);
    adminHelpers.getAllUsers().then((AllUsers) => {
      var Data = {
        Branches: AllBranches,
        Users: AllUsers
      }
      res.json(Data);
    })
  })
})

router.post('/EditBranchBranch', verifyLogin, (req, res) => {
  adminHelpers.UpdateBranchDetails(req.body).then((Status) => {
    res.redirect('/admin/Branches');
  })
})

router.get('/Inventory/Api', verifyLogin, (req, res) => {
  adminHelpers.GetAllInventory().then((AllInventory) => {
    res.json(AllInventory);
  })
})

router.get('/UpdateProductStock/:BranchID/:ProductID/:NewStock/api', verifyLogin, (req, res) => {
  console.log("Branch: ", req.params.BranchID, " Product ID: ", req.params.ProductID);
  var sendData = `Branch: ${req.params.BranchID},  Product ID: ${req.params.ProductID} `;

  console.log(req.params.NewStock);
  // { NewStock: '1' }
  if (!isNaN(req.params.NewStock)) {
    adminHelpers.UpdateProductStock(req.params.BranchID, req.params.ProductID, req.params.NewStock).then((ProductLatest) => {
      // res.send(sendData);
      var currentStock
      ProductLatest.BranchStocks.forEach((BranchStock) => {
        if (BranchStock.BranchID === req.params.BranchID) {
          currentStock = BranchStock.Stock
        }
      })
      res.json({ Status: true, Stock: currentStock });
      // res.redirect('/admin/Branches')
    })
  } else {
    res.json({ Status: false });
  }
})

router.get('/UpdateBinderStock/:BranchID/:BinderID/:NewStock/api', verifyLogin, (req, res) => {
  console.log("Branch: ", req.params.BranchID, " BinderID ID: ", req.params.BinderID);
  var sendData = `Branch: ${req.params.BranchID},  BinderID ID: ${req.params.BinderID} `;

  console.log(req.params.NewStock);
  // { NewStock: '1' }
  if (!isNaN(req.params.NewStock)) {
    adminHelpers.UpdateBinderStock(req.params.BranchID, req.params.BinderID, req.params.NewStock).then((ProductLatest) => {
      // res.send(sendData);
      var currentStock
      ProductLatest.BranchStocks.forEach((BranchStock) => {
        if (BranchStock.BranchID === req.params.BranchID) {
          currentStock = BranchStock.Stock
        }
      })
      res.json({ Status: true, Stock: currentStock });
      // res.redirect('/admin/Branches')
    })
  } else {
    res.json({ Status: false });
  }
})


router.get('/UpdateAdditiveStock/:BranchID/:AdditiveID/:NewStock/api', verifyLogin, (req, res) => {
  console.log("Branch: ", req.params.BranchID, " AdditiveID ID: ", req.params.AdditiveID);
  var sendData = `Branch: ${req.params.BranchID},  AdditiveID ID: ${req.params.AdditiveID} `;

  console.log(req.params.NewStock);
  // { NewStock: '1' }
  if (!isNaN(req.params.NewStock)) {
    adminHelpers.UpdateAdditiveStock(req.params.BranchID, req.params.AdditiveID, req.params.NewStock).then((ProductLatest) => {
      // res.send(sendData);
      var currentStock
      ProductLatest.BranchStocks.forEach((BranchStock) => {
        if (BranchStock.BranchID === req.params.BranchID) {
          currentStock = BranchStock.Stock
        }
      })
      res.json({ Status: true, Stock: currentStock });
      // res.redirect('/admin/Branches')
    })
  } else {
    res.json({ Status: false });
  }
})

router.get('/deleteUser/:UserID', verifyLogin, (req, res) => {
  console.log(req.params.UserID);
  adminHelpers.deleteUserByUserID(req.params.UserID).then(() => {
    res.redirect('/admin/Users')
  })
})

router.post('/AddProductGroup', verifyLogin, (req, res) => {
  console.log(req.body);
  adminHelpers.AddProductGroup(req.body).then((State) => {
    if (State) {
      if (State.Error) {
        res.redirect(`/admin/Product?Error=${State.Error}`);
      }
    }
    else {
      res.redirect('/admin/Product');
    }
  })
})

router.get('/removeProductGroup/:GroupName', verifyLogin, (req, res) => {
  adminHelpers.deleteProductGroup(req.params.GroupName).then(() => {
    res.redirect('/admin/Product');
  })
})














router.get('/GetLedgerData', verifyLogin, (req, res) => {
  res.render('admin/GetLedgerData', { admin: true })
})

router.post('/uploadLedgerData', async (req, res) => {

  try {
    // Check if the file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // The uploaded file is available in req.files.excelFile
    const excelFile = req.files.excelFile;
    // Example: Log the file details
    console.log('Uploaded File:', excelFile);

    // Get start data and end data
    let data = [];
    // Create a new workbook using exceljs
    const workbook = new ExcelJS.Workbook();

    // Use the file data directly from req.files.excelFile.data
    await workbook.xlsx.load(excelFile.data);

    // Get the last worksheet
    const lastSheet = workbook.getWorksheet(workbook.worksheets.length);

    // Convert the last sheet to JSON
    const lastSheetData = lastSheet.getSheetValues();

    // Append the data to the result array
    data.push(...lastSheetData);

    const TestDatas = await ledgerHelper.doSomeSampleTest(data);
    const datas = await ledgerHelper.doAdvancedSampleTest(TestDatas.Arrays);

    // Get table data.
    // Convert the Buffer to a Readable stream
    const stream = new Readable();
    stream.push(excelFile.data);
    stream.push(null);

    const workbookTable = new ExcelJS.Workbook();
    await workbookTable.xlsx.read(stream);

    // Get the last sheet for table data
    const lastSheetTable = workbookTable.getWorksheet(workbookTable.worksheets.length);

    // Extract column names from the 8th row
    const columnNames = lastSheetTable.getRow(8).values;

    // Map the keys to the desired format for table data
    const mappedData = [];
    lastSheetTable.eachRow({ includeEmpty: false, range: 9 }, (row, rowNumber) => {
      const rowData = {};
      row.values.forEach((value, index) => {
        rowData[columnNames[index]] = value;
      });
      mappedData.push(rowData);
    });

    const UpdatedMapedData = await ledgerHelper.OranizeTableData(mappedData, datas.Objects);

    // After all are executed, proceed to res.send
    const finalOutput = datas.Objects

    finalOutput.TableData = UpdatedMapedData
    adminHelpers.storeLedgerData(finalOutput).then(() => {
      // res.send(finalOutput);
      res.redirect('/sales/Customer');
    })
  } catch (error) {
    res.status(500).send(error.message);
  }

});

// router.get('/ViewBranch/:BranchName',verifyLogin,(req,res) => {
//   adminHelpers.getBranchByName(req.params.BranchName).then((Branch)=>{
//     res.render('admin/viewbranch',{admin :true , branch : Branch});
//   })
// })





module.exports = router;