var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/adminHelpers');

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
  }
}

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  adminHelpers.getCategory().then((AllCategory) => {
    // console.log("Calling Admin Dash")
    if (req.query.Error) {
      res.render('admin/Dashboard', { admin: true, AllCategory, AddError: req.query.Error });
    }
    res.render('admin/Dashboard', { admin: true, AllCategory });
  })
});

router.get('/login', (req, res) => {
  res.render('admin/forms/AdminLogin', { admin: true });
})

router.post('/Login', (req, res) => {
  console.log(req.body);
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

router.get('/change-password', (req, res) => {
  res.render('admin/forms/ChangePassword', { admin: true });
})

router.post('/change-password', (req, res) => {
  console.log(req.body);
  adminHelpers.AdminPasswordChange(req.body, AdminUser).then((response) => {
    console.log(response);
    if (response.Status == false) {
      res.render('admin/forms/ChangePassword', { admin: true, StateError: response.err });
    } else {
      res.redirect("/admin");
    }
  })

})

router.post('/addCategory', (req, res) => {
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

router.get('/Detele-Category/:id', (req, res) => {
  adminHelpers.DeleteCategory(req.params.id).then((State) => {
    res.redirect('/admin');
  })
})

router.get('/Sub-Category', (req, res) => {
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
        console.log(Binders)
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

router.get('/addSubCategory', (req, res) => {
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
        console.log(Binders)
        res.render('admin/forms/addSubCategory', { admin: true, AllCategory, AllSubCategory, Binders });
      })
    })
  })
})

router.post('/AddSubCategory', (req, res) => {
  // console.log(req.body)
  adminHelpers.AddSubCategory(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Sub-Category');
    } else {
      res.redirect(`/admin/Sub-Category/?Error=${State.error}`);
    }
  })
})

router.get('/edit-subcategory/:id', (req, res) => {
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
        const matchingBinders = [matchingBinder1, ...Binders.filter((binder) => binder.Binder_Id !== matchingBinder1.Binder_Id)];

        // console.log(matchingCategories);
        // console.log(matchingBinders);

        AllCategory = matchingCategories;
        Binders = matchingBinders;

        console.log(SubCategory);

        var Gram, Liter, Matt, Gloss, Binder2;

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

        console.log(Gram, Liter, Matt, Gloss);

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
          console.log("Remaining Binders:");
          console.log(remainingBinders);
          Binder2 = remainingBinders;
          var EditSubcategory = true
          res.render('admin/forms/addSubCategory', { admin: true, EditSubcategory, AllCategory, SubCategory, Binders, Gram, Liter, Matt, Gloss, Binder2 });
        } else {
          var EditSubcategory = true
          res.render('admin/forms/addSubCategory', { admin: true, EditSubcategory, AllCategory, SubCategory, Binders, Gram, Liter, Matt, Gloss, Binder2 });
        }


      })
    })
  })
})


router.post('/EditSubCategory', (req, res) => {
  // console.log(req.body);
  adminHelpers.EditSubcategoryBy(req.body).then((response) => {
    res.redirect('/admin/Sub-Category');
  })
})

router.get('/Product', (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    // console.log(AllCategory)
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      // console.log(AllSubCategory)
      const filteredSubCategories = AllSubCategory.filter(subCategory => subCategory.Category_Id === '100');
      AllSubCategory = filteredSubCategories;
      res.render('admin/product', { admin: true, AllCategory, AllSubCategory });
    })
  })
})

router.get('/GetAllProduct-Cat-Sub/api/:id', (req, res) => {
  adminHelpers.GetProduct(req.params.id).then((products) => {
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

router.get('/addProduct', (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    // console.log(AllCategory)
    adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
      // console.log(AllSubCategory)
      const filteredSubCategories = AllSubCategory.filter(subCategory => subCategory.Category_Id === '100');
      AllSubCategory = filteredSubCategories;
      res.render('admin/forms/addProducts', { admin: true, AllCategory, AllSubCategory });
    })
  })
})

router.post('/addProducts', (req, res) => {
  adminHelpers.addProduct(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Product');
    } else {
      res.redirect(`/admin/Product/?Error=${State.error}`);
    }
  })
})

router.get('/Categories/api', (req, res) => {
  adminHelpers.getCategory().then((AllCategory) => {
    res.json(AllCategory)
  })
})

router.get('/editProduct/:id', (req, res) => {
  console.log(req.params.id);
  adminHelpers.GetProductByID(req.params.id).then((product) => {
    adminHelpers.getCategory().then((AllCategory) => {
      adminHelpers.GetAllSubCategory().then((AllSubCategory) => {
        console.log(product);
        var CategoryID = product.Category;
        var SubCategoryID = product.SubCategory

        var matchingCategory = AllCategory.find((category) => category.Category_Id === parseInt(CategoryID));
        const NotMatchingCategories = AllCategory.filter(category => category.Category_Id !== parseInt(CategoryID));

        var matchingSubCategory = AllSubCategory.find((SubCategory) => SubCategory.SubCategory_Id === parseInt(SubCategoryID));
        const NotMatchingSubCategory = AllSubCategory.filter(SubCategory => SubCategory.SubCategory_Id !== parseInt(SubCategoryID));

        res.render('admin/forms/addProducts', { admin: true, editProduct: true, product, matchingCategory, NotMatchingCategories, matchingSubCategory, NotMatchingSubCategory })
      })
    })
  })
})

router.post('/UpdateProducts', (req, res) => {
  adminHelpers.UpdateProduct(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Product')
    }
  })
});

router.get('/DeleteProduct/:id', (req, res) => {
  adminHelpers.DeleteProductById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Product');
    } else {
      res.redirect(`/admin/Product/?Error=${State.error}`);
    }
  })
})


router.get('/Additives', (req, res) => {
  adminHelpers.GetAllAdditives().then((Additives) => {
    res.render('admin/Additives', { admin: true, Additives });
  })
})

router.post('/AddAdditives', (req, res) => {
  adminHelpers.AddAdditives(req.body).then((State) => {
    console.log(State)
    if (State.Status) {
      res.redirect('/admin/Additives');
    } else {
      res.redirect(`/admin/Additives/?Error=${State.error}`);
    }
  })
})

router.get('/deleteAdditive/:id', (req, res) => {
  adminHelpers.DeleteAdditiveById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Additives');
    } else {
      res.redirect(`/admin/Additives/?Error=${State.error}`);
    }
  })
})

router.get('/Binders', (req, res) => {
  adminHelpers.GetAllBinders().then((Binders) => {
    res.render('admin/Binders', { admin: true, Binders });
  })
})

router.post('/AddBinders', (req, res) => {
  adminHelpers.AddBinders(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Binders');
    } else {
      res.redirect(`/admin/Binders/?Error=${State.error}`);
    }
  })
})

router.get('/deleteBinder/:id', (req, res) => {
  adminHelpers.DeleteBinderById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Binders');
    } else {
      res.redirect(`/admin/Binders/?Error=${State.error}`);
    }
  })
})

router.post('/AddEmployee', (req, res) => {
  adminHelpers.AddEmployee(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Employees');
    } else {
      res.redirect(`/admin/Employees/?Error=${State.error}`);
    }
  })
})

router.get('/Employees', (req, res) => {
  adminHelpers.GetAllEmployees().then((Employees) => {
    res.render('admin/Employees', { admin: true, Employees });
  })
})

router.get('/editEmployee/:id', (req, res) => {
  adminHelpers.GetEmployeeById(req.params.id).then((Employee) => {
    console.log(Employee);
    res.render('admin/forms/editEmployee', { admin: true, Employee });
  })
})

router.post('/EditEmployee/:id', (req, res) => {
  adminHelpers.UpdateEmployee(req.body, req.params.id).then(() => {
    res.redirect('/admin/Employees');
  })
})

router.get('/deleteEmployee/:id', (req, res) => {
  adminHelpers.DeleteEmployeeById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Employees');
    } else {
      res.redirect(`/admin/Employees/?Error=${State.error}`);
    }
  })
})

router.get('/Customers', (req, res) => {
  adminHelpers.getAllCustomers().then((customers) => {
    res.render('admin/Customer', { admin: true, customers });
  })
})


router.post('/AddCustomer', (req, res) => {
  adminHelpers.AddCustomer(req.body).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Customers');
    } else {
      res.redirect(`/admin/Customers/?Error=${State.error}`);
    }
  })
})

router.get('/editCustomer/:id', (req, res) => {
  adminHelpers.GetCustomerById(req.params.id).then((Customer) => {
    res.render('admin/forms/editCustomer', { admin: true, Customer });
  })
})

router.post('/EditCustomer/:id', (req, res) => {
  adminHelpers.UpdateCustomer(req.body, req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Customers');
    } else {
      res.redirect(`/admin/Customers/?Error=${State.error}`);
    }
  })
})

router.get('/DeleteCustomer/:id', (req, res) => {
  adminHelpers.DeleteCustomerById(req.params.id).then((State) => {
    if (State.Status) {
      res.redirect('/admin/Customers');
    } else {
      res.redirect(`/admin/Customers/?Error=${State.error}`);
    }

  })
})


module.exports = router;