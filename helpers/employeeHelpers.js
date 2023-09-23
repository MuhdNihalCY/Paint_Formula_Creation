var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId, ReturnDocument } = require('mongodb');
const { use } = require('../routes/employee');
const { reset } = require('nodemon');
const res = require('express/lib/response');

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
            const subCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ SubCategory_Id: parseInt(SubId) });
            const productIds = subCategory.Products.map(productId => parseInt(productId));
            const promises = productIds.map(productId => db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: productId }));
            const products = await Promise.all(promises);

            resolve(products);
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
    GetProductByArrayOfProductByName: (ArrayOfProduct) => {
        return new Promise(async (resolve, reject) => {
            var Products = [];

            for (var i = 0; i < ArrayOfProduct.length - 1; i++) {
                var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Name: ArrayOfProduct[i] });
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

            checkFileNoDuplicates()

            // check the file no for duplicates
            async function checkFileNoDuplicates() {
                // console.log("Checking for duplicates: ", Data.FileNo);

                var fileNo = Data.FileNo;
                var SameFileNoFormula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ FileNo: fileNo });
                // console.log("SameFileNoFormula: ", SameFileNoFormula);
                if (SameFileNoFormula) {
                    Data.FileNo = (parseInt(Data.FileNo) + 1).toString();
                    checkFileNoDuplicates();
                } else {
                    SaveFormulaData();
                }
            }

            async function SaveFormulaData() {
                await db.get().collection(collection.FORMULA_COLLECTION).insertOne(Data).then((Response) => {
                    if (!Response) {
                        throw "Error";
                    } else {
                        resolve({
                            Status: true,
                            Data:Data
                        })
                    }
                })
            }
        })
    },
    SaveEditedFormulaData: (Data) => {
        return new Promise(async (resolve, reject) => {

            checkFileNoDuplicates()

            // check the file no for duplicates
            async function checkFileNoDuplicates() {
                // console.log("Checking for duplicates: ", Data.FileNo);

                var fileNo = Data.FileNo;
                var SameFileNoFormula = await db.get().collection(collection.EDITED_FROMULA_COLLECTION).findOne({ FileNo: fileNo });
                // console.log("SameFileNoFormula: ", SameFileNoFormula);
                if (SameFileNoFormula) {
                    Data.FileNo = (parseInt(Data.FileNo) + 1).toString();
                    checkFileNoDuplicates();
                } else {
                    SaveFormulaData();
                }
            }

            async function SaveFormulaData() {
                await db.get().collection(collection.EDITED_FROMULA_COLLECTION).insertOne(Data).then((Response) => {
                    if (!Response) {
                        throw "Error";
                    } else {
                        resolve({
                            Status: true,
                            Data:Data
                        })
                    }
                })
            }
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
    FindUpdatesFormulaByFileNo: (FileNo) => {
        return new Promise(async (resolve, reject) => {
            let Formula = await db.get().collection(collection.EDITED_FROMULA_COLLECTION).findOne({ "FileNo": FileNo });
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
    GetUpdatesFormulaByFileNo: (FileNo) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.EDITED_FROMULA_COLLECTION).findOne({ "FileNo": FileNo });
            resolve(Formula);
        })
    },
    TinterCheckStock: (TinterName, TinterQty) => {
        var State = {
            HaveStock: false,
            AvailableStock: 0
        }

        return new Promise(async (resolve, reject) => {
            // console.log("TinterName: ", TinterName)
            // console.log("TinterQTY: ", TinterQty)
            var Tinter = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": TinterName });
            TinterQty = parseFloat(TinterQty);
            // console.log("Tinter: ", Tinter);
            // console.log("parseFloat(Tinter.Stock): ", parseFloat(Tinter.Stock));
            if (Tinter) {
                if (parseFloat(Tinter.Stock) > TinterQty) {
                    // have Stock for this formula
                    State.HaveStock = true;
                    State.AvailableStock = parseFloat(Tinter.Stock);
                } else {
                    // TinterQty is more than avalialable Stock
                    State.HaveStock = false;
                    State.AvailableStock = parseFloat(Tinter.Stock);
                }
            } else {
                // TinterQty is more than avalialable Stock
                State.HaveStock = false;
                // State.AvailableStock = parseFloat(Tinter.Stock);
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
            var NewStock = OldStock + (parseFloat(Product.StandardQuatity) * (parseFloat(Data.NewStock)));
            if (NewStock >= 0) {
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            }
            resolve();
        })
    },
    UpdateBinderStockById: (Data) => {
        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Id": parseInt(Data.ProductId) })
            var OldStock = parseFloat(Binder.Stock);
            var NewStock = OldStock + (parseFloat(Data.NewStock));
            if (NewStock >= 0) {
                await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            }
            resolve();
        })
    },
    UpdateAdditiveStockById: (Data) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Id": parseInt(Data.ProductId) })
            var OldStock = parseFloat(Additive.Stock);
            var NewStock = OldStock + (parseFloat(Data.NewStock));
            // console.log(NewStock);
            if (NewStock >= 0) {
                await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
                resolve();
            } else {
                resolve()
            }

        })
    },
    getProductsWithLowStocks: () => {
        return new Promise(async (resolve, reject) => {
            var Products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Stock: { $lt: 200 } }).toArray()
            // console.log("Products:",Products);
            resolve(Products);
        })
    },
    getAllBinderWithLowStocks: () => {
        return new Promise(async (resolve, reject) => {
            var Binders = await db.get().collection(collection.BINDER_COLLECTION).find({ Stock: { $lt: 100 } }).toArray()
            // console.log('Binders : ',Binders)
            resolve(Binders);
        })
    },
    getAllAdditivesWithLowStocks: () => {
        return new Promise(async (resolve, reject) => {
            var Additives = await db.get().collection(collection.ADDITIVE_COLLECTION).find({ Stock: { $lt: 100 } }).toArray()
            // console.log('Additives:', Additives)
            resolve(Additives)
        })
    },
    GetAllOrderList: () => {
        return new Promise(async (resolve, reject) => {
            var Orders = await db.get().collection(collection.BULK_ORDER_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray();
            resolve(Orders);
        })
    },
    getOrderByInsertedTime: (time) => {
        return new Promise(async (resolve, reject) => {
            var Order = await db.get().collection(collection.BULK_ORDER_COLLECTION).findOne({ InsertedTime: parseInt(time) });
            resolve(Order);
        })
    },
    GetSubCategoriesByName: (name) => {
        return new Promise(async (resolve, reject) => {
            var Sub_Category = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ SubCategory: name });
            resolve(Sub_Category)
        })
    },
    getBinderByName: (BinderName) => {
        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Name: BinderName });
            resolve(Binder);
        })
    },
    getAdditivesById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ Additive_Id: parseInt(id) });
            resolve(Additive);
        })
    },
    getProductByName: (P_name) => {
        return new Promise(async (resolve, reject) => {
            var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Name: P_name });
            resolve(Product);
        })
    },
    GetSubcategotyByName: (S_Name) => {
        return new Promise(async (resolve, reject) => {
            var Subcategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ SubCategory: S_Name });
            resolve(Subcategory)
        })
    },
    GetBinderById: (B_ID) => {
        return new Promise(async (resolve, reject) => {
            var binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Id: parseInt(B_ID) });
            resolve(binder)
        })
    },
    GetAllSubCategoriesByMatchingCategory: (CategoryID) => {
        return new Promise(async (resolve, reject) => {
            // console.log("Requested CategoryID: ",CategoryID);
            var SubCategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find({ Category_Id: CategoryID.toString() }).toArray();
            resolve(SubCategories);
        })
    },
    GetAllTinteresByFormula: (Formula) => {
        return new Promise(async (resolve, reject) => {
            var TintersArray = [];
            // console.log(Formula)
            for (let i = 1; i <= Formula.TintersCount; i++) {
                let tinterObj = {
                    TinterName: Formula[`TinterNameR${i}`],
                    TinterPrice: parseFloat(Formula[`TinterPriceR${i}`]),
                    TinterPriceUnit: Formula[`TinterPriceUnit${i}`],
                    TinterDensity: parseFloat(Formula[`TinterDensity${i}`]),
                    GramInputTotal: parseFloat(Formula[`GramInputTotalR${i}`]),
                    LiterInputTotal: parseFloat(Formula[`LiterInputTotalR${i}`]),
                    TinterCount: i
                };
                TintersArray.push(tinterObj);
            }
            // console.log(TintersArray);
            resolve(TintersArray);
        })
    },



    // customer
    CheckCustomerLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            var isCustomer = await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ Customer_Name: data.userName });
            if (isCustomer) {
                //have user
                if (isCustomer.Password === data.password) {
                    //correct user name and password
                    delete isCustomer.Password;
                    delete isCustomer.InsertedTime;
                    delete isCustomer.Employee_Name;
                    isCustomer.Status = true;

                    // console.log(isCustomer);

                    resolve(isCustomer);
                } else {
                    resolve({ Err: "Wrong Password!" });
                    //wrong password
                }
            } else {
                // no user found!
                resolve({ Err: "User not found!" })
            }
        })
    },
    GetAllFormulaByCustomerName: (Customer_Name) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.FORMULA_COLLECTION).find({ CustomerName: Customer_Name }).sort({ "InsertedTime": -1 }).toArray();
            resolve(Formula);
        })
    },
    GetAllToCalCostCustomerById: (FormulaID, customerCategory) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ FileNo: FormulaID });

            // console.log("Formula: ", Formula);

            for (let i = 1; i <= parseInt(Formula.TintersCount); i++) {
                var TinterName = Formula[`TinterNameR${i}`];
                var Tinter = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Name: TinterName });
                //   console.log("Tineter: ", Tinter);

                // check fort tinter price and if not reject;
                // Get the corresponding price for the customer's category
                // const customerPrice = Tinter[`Category_${customerCategory.split(' ')[1]}`];


                // Replace this with the actual customer category name
                // const customerCategory = 'Category 2';

                // Find the price for the given customer category
                // const customerCategory = 'Category 1'; // Change this to test different customer categories

                function getPriceForCategory(customerCategory, tinter) {
                    for (const key in tinter) {
                        if (key.startsWith('CategoryName_') && tinter[key] === customerCategory) {
                            const index = key.split('_')[1];
                            const priceKey = `Category_${index}`;
                            return tinter[priceKey];
                        }
                    }
                    return null;
                }

                const customerPrice = getPriceForCategory(customerCategory, Tinter);

                if (customerPrice !== null) {
                    // console.log(`Price for ${customerCategory}: ${customerPrice}`);
                } else {
                    // console.log(`Price for ${customerCategory} not found.`);
                }



                if (customerPrice) {
                    //console.log(`Price for ${customerCategory}: ${customerPrice}`);
                    Formula[`TinterPriceR${i}`] = customerPrice;
                } else {
                    // price not decleared for this tinter.
                    resolve({ Status: false, errMsg: 'price not decleared for this tinter: ' + Tinter.Product_Name });
                }
            }

            // console.log("Formula Modified Tinter Price : ", Formula);

            // take binders

            var Binder1 = false;
            var Binder2 = false;


            if (Formula.Binder1Name) {
                Binder1 = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Name: Formula.Binder1Name });
                // console.log(Binder1);

                // Get the corresponding price for the customer's category
                // const customerBinder1Price = Binder1[`Category_${customerCategory.split(' ')[1]}`];

                // Find the price for the given customer category
                function getPriceForCategory(customerCategory, Binder1) {
                    for (const key in Binder1) {
                        if (key.startsWith('CategoryName_') && Binder1[key] === customerCategory) {
                            const index = key.split('_')[1];
                            const priceKey = `Category_${index}`;
                            return Binder1[priceKey];
                        }
                    }
                    return null;
                }

                const customerBinder1Price = getPriceForCategory(customerCategory, Binder1);

                if (customerBinder1Price !== null) {
                    // console.log(`Price for ${customerCategory}: ${customerBinder1Price}`);
                } else {
                    // console.log(`Price for ${customerCategory} not found.`);
                }



                if (customerBinder1Price) {
                    Formula.Binder1Price = customerBinder1Price;
                } else {
                    // price not decleared for this Binder.
                    resolve({ Status: false, errMsg: 'price not decleared for this Binder: ' + Binder1.Binder_Name })
                }

                if (Formula.Binder2Name) {
                    Binder2 = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Name: Formula.Binder2Name });
                    // console.log(Binder2);

                    // Get the corresponding price for the customer's category
                    // const customerBinder2Price = Binder2[`Category_${customerCategory.split(' ')[1]}`];

                    // Find the price for the given customer category
                    function getPriceForCategory(customerCategory, Binder2) {
                        for (const key in Binder2) {
                            if (key.startsWith('CategoryName_') && Binder2[key] === customerCategory) {
                                const index = key.split('_')[1];
                                const priceKey = `Category_${index}`;
                                return Binder2[priceKey];
                            }
                        }
                        return null;
                    }

                    const customerBinder2Price = getPriceForCategory(customerCategory, Binder2);



                    if (customerBinder2Price) {
                        Formula.Binder2Price = customerBinder2Price;
                    } else {
                        // price not decleared for this Binder.
                        resolve({ Status: false, errMsg: 'price not decleared for this Binder: ' + Binder2.Binder_Name });
                    }
                }
            }

            //  console.log("Formula Modified Binder Price : ", Formula);

            // take Additives

            if (Formula.AdditiveName) {
                var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ Additive_Name: Formula.AdditiveName });

                // Get the corresponding price for the customer's category
                // const customerAdditivePrice = Additive[`Category_${customerCategory.split(' ')[1]}`];

                // Find the price for the given customer category
                function getPriceForCategory(customerCategory, Additive) {
                    for (const key in Additive) {
                        if (key.startsWith('CategoryName_') && Additive[key] === customerCategory) {
                            const index = key.split('_')[1];
                            const priceKey = `Category_${index}`;
                            return Additive[priceKey];
                        }
                    }
                    return null;
                }

                const customerAdditivePrice = getPriceForCategory(customerCategory, Additive);

                if (customerAdditivePrice) {
                    Formula.AdditivePrice = customerAdditivePrice;
                } else {
                    // price not decleared for this Additive.
                    resolve({ Status: false, errMsg: 'price not decleared for this Additive: ' + Additive.Additive_Name })
                }
            }

            //  console.log("Formula Modified Additive Price : ", Formula);

            resolve(Formula);

        })
    },
    GetAllOrderListByCustomer: (CustomerName) => {
        return new Promise(async (resolve, reject) => {
            var Orders = await db.get().collection(collection.BULK_ORDER_COLLECTION).find({ Mixer: CustomerName }).sort({ "InsertedTime": -1 }).toArray();
            resolve(Orders);
        })
    },
    GetAllFormulationsByCustomer: (CustomerName) => {
        return new Promise(async (resolve, reject) => {
            var Formulations = await db.get().collection(collection.FORMULA_COLLECTION).find({ MixerName: CustomerName }).sort({ "InsertedTime": -1 }).toArray();
            resolve(Formulations)
        })
    }

}