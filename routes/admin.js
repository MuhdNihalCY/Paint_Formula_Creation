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
    // console.log("Calling Admin Dash")
    if (req.query.Error) {
      res.render('admin/Dashboard', { admin: true, AllCategory, AddError: req.query.Error });
    }
    res.render('admin/Dashboard', { admin: true, AllCategory });
  })
});

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
      res.render('admin/subCategory', { admin: true, AllCategory, AllSubCategory });
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

router.get('/Product', (req, res) => {
  adminHelpers.getCategory().then((AllCategory)=>{
    // console.log(AllCategory)
    adminHelpers.GetAllSubCategory().then((AllSubCategory)=>{
      // console.log(AllSubCategory)
      const filteredSubCategories = AllSubCategory.filter(subCategory => subCategory.Category_Id === '100');
      AllSubCategory = filteredSubCategories;
      res.render('admin/product', { admin: true, AllCategory, AllSubCategory });
    })
  })
})

router.get('/GetAllProduct-Cat-Sub/api/:id',(req,res)=>{
  adminHelpers.GetProduct(req.params.id).then((products)=>{
    adminHelpers.getCategory().then((Category)=>{
      adminHelpers.GetAllSubCategory().then((SubCategory)=>{
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

router.get('/GetAllProduct-Cat-Sub/api',(req,res)=>{
  adminHelpers.GetAllProduct().then((products)=>{
    adminHelpers.getCategory().then((Category)=>{
      adminHelpers.GetAllSubCategory().then((SubCategory)=>{
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

router.get('/addProduct',(req,res)=>{
  adminHelpers.getCategory().then((AllCategory)=>{
    // console.log(AllCategory)
    adminHelpers.GetAllSubCategory().then((AllSubCategory)=>{
      // console.log(AllSubCategory)
      const filteredSubCategories = AllSubCategory.filter(subCategory => subCategory.Category_Id === '100');
      AllSubCategory = filteredSubCategories;
      res.render('admin/forms/addProducts', { admin: true , AllCategory, AllSubCategory } );
    })
  })
})

router.post('/addProducts',(req,res)=>{
  adminHelpers.addProduct(req.body).then((State)=>{
    if(State.Status){
      res.redirect('/admin/Product');
    }else{
      res.redirect(`/admin/Product/?Error=${State.error}`);
    }
  })
})

router.get('/Categories/api',(req,res)=>{
  adminHelpers.getCategory().then((AllCategory)=>{
    res.json(AllCategory)
  })
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
