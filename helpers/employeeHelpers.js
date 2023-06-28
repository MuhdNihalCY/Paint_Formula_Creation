var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');
const { use } = require('../routes/employee');
const { reset } = require('nodemon');

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
            // console.log(SubId)
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
            var Formulations = db.get().collection(collection.FORMULA_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray();
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
                // console.log("No Latest Formula");
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
    },
    GetFormulaByFileNo: (FileNo) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ "FileNo": FileNo });
            resolve(Formula);
        })
    },
    TinterCheckStock: (TinterName, TinterQty) => {
        var State = {
            HaveStock: false,
            AvailableStock: 0
        }

        return new Promise(async (resolve, reject) => {
            var Tinter = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": TinterName });
            TinterQty = parseFloat(TinterQty);
            if (parseFloat(Tinter.Stock) > TinterQty) {
                // have Stock for this formula
                State.HaveStock = true;
                State.AvailableStock = parseFloat(Tinter.Stock);
            } else {
                // TinterQty is more than avalialable Stock
                State.HaveStock = false;
                State.AvailableStock = parseFloat(Tinter.Stock);
            }

            resolve(State);
        })
    },
    BinderCheckStock: (BinderName, BinderQTY) => {

        var State = {
            HaveStock: false,
            AvailableStock: 0
        }

        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": BinderName });
            BinderQTY = parseFloat(BinderQTY);
            if (parseFloat(Binder.Stock) > BinderQTY) {
                // have Stock for this formula
                State.HaveStock = true;
                State.AvailableStock = parseFloat(Binder.Stock);
            } else {
                // TinterQty is more than avalialable Stock
                State.HaveStock = false;
                State.AvailableStock = parseFloat(Binder.Stock);
            }

            resolve(State);
        })
    },
    AdditiveCheckStock: (AdditiveName, AdditiveQTY) => {
        var State = {
            HaveStock: false,
            AvailableStock: 0
        }

        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Name": AdditiveName });
            AdditiveQTY = parseFloat(AdditiveQTY);
            if (parseFloat(Additive.Stock) > AdditiveQTY) {
                // have Stock for this formula
                State.HaveStock = true;
                State.AvailableStock = parseFloat(Additive.Stock);
            } else {
                // TinterQty is more than avalialable Stock
                State.HaveStock = false;
                State.AvailableStock = parseFloat(Additive.Stock);
            }

            resolve(State);
        })
    },

    BulkOrderUpdate: (OrderFile) => {
        return new Promise(async (resolve, reject) => {
            try {
                // console.log("OrderFile From Helpers: ", OrderFile);
                var TinterCount = parseInt(OrderFile.TinterCount);

                OrderFile.InsertedTime = Date.now();
                await db.get().collection(collection.BULK_ORDER_COLLECTION).insertOne(OrderFile);

                // Update Product stock
                for (let i = 1; i <= TinterCount; i++) {
                    var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": OrderFile[`TineterName${i}`] });
                    var OldStock = parseFloat(Product.Stock);
                    var NewStock = OldStock - parseFloat(OrderFile[`TinterGram${i}`]);
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Name": OrderFile[`TineterName${i}`] }, { $set: { Stock: NewStock } });
                }

                // Update Binder Stock
                if (OrderFile.Binder1) {
                    var Binder1 = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": OrderFile.Binder1 });
                    var BindersOldStock = parseFloat(Binder1.Stock);
                    var BindersNewStock = BindersOldStock - parseFloat(OrderFile.Binder1QTY);
                    await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Name": OrderFile.Binder1 }, { $set: { Stock: BindersNewStock } });
                }

                if (OrderFile.Binder2) {
                    var Binder2 = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": OrderFile.Binder2 });
                    var BindersOldStock = parseFloat(Binder2.Stock);
                    var BindersNewStock = BindersOldStock - parseFloat(OrderFile.Binder2QTY);
                    await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Name": OrderFile.Binder2 }, { $set: { Stock: BindersNewStock } });
                }

                if (OrderFile.Additive) {
                    var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Name": OrderFile.Additive });
                    var AdditiveOldStock = parseFloat(Additive.Stock);
                    var AdditiveNewStock = AdditiveOldStock - parseFloat(OrderFile.AdditiveQTY);
                    await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Name": OrderFile.Additive }, { $set: { Stock: AdditiveNewStock } });
                }

                resolve(); // Resolve the promise after all operations are completed
            } catch (error) {
                reject(error);
            }
        });
    },
    UpdateProductStockById: (Data) => {
        return new Promise(async (resolve, reject) => {
            var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Id": parseInt(Data.ProductId) })
            var OldStock = parseFloat(Product.Stock);
            var NewStock = OldStock + (parseFloat(Data.NewStock));
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            resolve();
        })
    },
    UpdateBinderStockById: (Data) => {
        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Id": parseInt(Data.ProductId) })
            var OldStock = parseFloat(Binder.Stock);
            var NewStock = OldStock + (parseFloat(Data.NewStock));
            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            resolve();
        })
    },
    UpdateAdditiveStockById: (Data) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Id": parseInt(Data.ProductId) })
            var OldStock = parseFloat(Additive.Stock);
            var NewStock = OldStock + (parseFloat(Data.NewStock));
            await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            resolve();
        })
    },
    getProductsWithLowStocks:()=>{
        return new Promise(async(resolve,reject)=>{
            var Products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Stock: { $lt: 200 } }).toArray()
            // console.log("Products:",Products);
            resolve(Products);
        })
    },
    getAllBinderWithLowStocks:()=>{
        return new Promise(async(resolve,reject)=>{
            var Binders = await db.get().collection(collection.BINDER_COLLECTION).find({ Stock: { $lt: 100 } }).toArray()
            // console.log('Binders : ',Binders)
            resolve(Binders);
        })
    },
    getAllAdditivesWithLowStocks:()=>{
        return new Promise(async(resolve,reject)=>{
            var Additives = await db.get().collection(collection.ADDITIVE_COLLECTION).find({ Stock: { $lt: 100 } }).toArray()
            // console.log('Additives:', Additives)
            resolve(Additives)
        })
    },
    GetAllOrderList:()=>{
        return new Promise(async(resolve,reject)=>{
            var Orders = await db.get().collection(collection.BULK_ORDER_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray();
            resolve(Orders);
        })
    },
    getOrderByInsertedTime:(time)=>{
        return new Promise(async(resolve,reject)=>{
            var Order = await db.get().collection(collection.BULK_ORDER_COLLECTION).findOne({InsertedTime: parseInt(time)});
            resolve(Order);
        })
    },
    GetSubCategoriesByName:(name)=>{
        return new Promise(async(resolve,reject)=>{
            var Sub_Category = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({SubCategory:name});
            resolve(Sub_Category)
        })
    }

}