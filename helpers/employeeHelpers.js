var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');
const { use } = require('../routes/employee');

module.exports = {
    DoLogin: (Data) => {
        return new Promise(async (resolve, reject) => {
            var State = {}
            var User = await db.get().collection(collection.EMPLOYEE_COLLECTION).findOne({ "Employee_Name": Data.userName });
            if (User) {
                // user ok. 
                //check password
                if (User.Password === Data.password) {
                    State.employeeLooged = true;
                } else {
                    State.employeeLooged = false;
                    State.err = "Incorrect Password!"
                }
            } else {
                //check user by email
                var User = await db.get().collection(collection.EMPLOYEE_COLLECTION).findOne({ "Email": Data.userName });
                if (User) {
                    // user Ok 
                    // check password
                    if (User.Password === Data.password) {
                        State.employeeLooged = true;
                    } else {
                        State.employeeLooged = false;
                        State.err = "Incorrect Password!"
                    }
                } else {
                    State.employeeLooged = false;
                    State.err = 'No User Found!'
                }
            }
            resolve(State);
        })
    },
    CreateNewUser: () => {
    },
    getAllCollections: () => {
        return new Promise(async (resovle, reject) => {
            var AllCategory = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resovle(AllCategory);
        })
    },
    GetProductBySubId: (SubId) => {
        return new Promise(async (resolve, reject) => {
            SubId = SubId + '';
            var Products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ SubCategory: SubId }).toArray();
            resolve(Products)
        })
    },
    GetSubcategotyById: (SubId) => {
        return new Promise(async (resolve, reject) => {
            console.log(SubId)
            var SubCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ SubCategory_Id: parseInt(SubId) })
            resolve(SubCategory)
        })
    },
    getBinderById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Id: parseInt(id) });
            // console.log("kfdjslfkjdfjshafkljsfjhsflhdjsfjdshfklsdhfdshfklsdfjdhsflhdsklfdhsfhdlshfksdhfdklsflkdjsf");
            // console.log(Binder);
            resolve(Binder);
        })
    },
    GetAllAdditives: () => {
        return new Promise(async (resolve, reject) => {
            var Additives = await db.get().collection(collection.ADDITIVE_COLLECTION).find().toArray();
            resolve(Additives);
        })
    },
    GetProductByArrayOfProductById: (ArrayOfProduct) => {
        return new Promise(async (resolve, reject) => {
            var Products = [];

            for (var i = 0; i < ArrayOfProduct.length - 1; i++) {
                var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(ArrayOfProduct[i]) });
                Products.push(Product);
            }
            // console.log("ProductByID:",Products);
            resolve(Products)
        })
    },
    FindProductByName: (ProductName) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": ProductName })
            resolve(product)
        })
    },
    FindAdditiveDensityById: (Add_Id) => {
        return new Promise(async (resolve, reject) => {
            let additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Id": parseFloat(Add_Id) });
            resolve(additive);
        })
    },
    FindBinderByName: (BinderName) => {
        return new Promise(async (resovle, reject) => {
            let Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": BinderName });
            resovle(Binder);
        })
    },
    SaveFormulaData: (Data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.FORMULA_COLLECTION).insertOne(Data).then((Response) => {
                if (!Response) {
                    throw "Error";
                } else {
                    resolve({
                        Status: true
                    })
                }
            })
        })
    },
    GetAllFormulations: () => {
        return new Promise(async (resolve, reject) => {
            var Formulations = db.get().collection(collection.FORMULA_COLLECTION).find().toArray();
            resolve(Formulations)
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let Categories = db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            resolve(Categories);
        })
    },
    GetAllSubCategories: () => {
        return new Promise(async (resolve, reject) => {
            let SubCategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().toArray();
            resolve(SubCategories)
        })
    },
    FindFormulaByFileNo: (FileNo) => {
        return new Promise(async (resolve, reject) => {
            let Formula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ "FileNo": FileNo });
            resolve(Formula);
        })
    },
    getThisFormulaFileNo: () => {
        return new Promise(async (resolve, reject) => {
            var FileNo = 0;
            let LatestFormula = await db.get().collection(collection.FORMULA_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray();
            if (LatestFormula.length > 0) {
                //console.log(LatestFormula);
                var LatestFileNo = parseInt(LatestFormula[0].FileNo);
                FileNo = LatestFileNo + 1;
            } else {
                console.log("No Latest Formula");
                FileNo = 10000
            }
            FileNo = FileNo + "";
            resolve(FileNo);
        })
    },
    GetAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            var Products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(Products);
        })
    },
    GetAllBinders: () => {
        return new Promise(async (resolve, reject) => {
            var Binders = await db.get().collection(collection.BINDER_COLLECTION).find().toArray();
            resolve(Binders);
        })
    },
    GetSubCategoriesById: (Id) => {
        return new Promise(async (resolve, reject) => {
            //console.log("SubCategory ID: ",Id);
            var SubCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ "SubCategory_Id": parseInt(Id) })
            resolve(SubCategory);
        })
    },
    FindAdditiveById: (Id) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Id": parseInt(Id) })
            resolve(Additive);
        })
    }
}