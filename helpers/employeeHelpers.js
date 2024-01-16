var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId, ReturnDocument } = require('mongodb');
const { ReservationListInstance } = require('twilio/lib/rest/taskrouter/v1/workspace/task/reservation');
const { response } = require('express');

var express = require('express');
const fs = require('fs');
var app = express();
var path = require('path');
const whatsappHelper = require('./whatsappHelper');

module.exports = {
    DoLogin: (Data) => {
        return new Promise(async (resolve, reject) => {
            var State = {}
            console.log(Data)  // { userName: 'fdsfad', password: 'sdfasdf' }
            var MatchedUser = await db.get().collection(collection.USERS_COLLECTION).findOne({ UserName: Data.userName });

            if (MatchedUser) {
                // have User with Name Matching
                if (MatchedUser.Password === Data.password) {
                    // password Match
                    delete MatchedUser.Password;
                    // console.log(MatchedUser);
                    State.User = MatchedUser;
                    State.loggedStatus = true
                    resolve(State)
                } else {
                    // incorrect Password
                    State.error = "Password not Match";
                    resolve(State)
                }
            } else {
                // incorrect User name
                State.error = "Username not Match";
                resolve(State)
            }
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
            // console.log("ArrayOfProduct:",ArrayOfProduct);

            for (var i = 0; i < ArrayOfProduct.length; i++) {
                // console.log("In process ProductByID:", parseInt(ArrayOfProduct[i]));
                var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(ArrayOfProduct[i]) });
                Products.push(Product);
            }
            // console.log("Finished ProductByID:", Products);
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
                            Data: Data
                        })
                    }
                })
            }
        })
    },
    StoreImageInDatabase: (SavedData, base64Image) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.FORMULA_COLLECTION).updateOne({ FileNo: SavedData.FileNo }, { $set: { "ImageBase64": base64Image } }).then(() => {
                resolve();
            })
        })
    },
    SaveEditedFormulaData: (Data) => {
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
                            Data: Data
                        })
                    }
                })
            }
        })
    },
    GetAllFormulations: () => {
        return new Promise(async (resolve, reject) => {
            var Formulations = await db.get().collection(collection.FORMULA_COLLECTION).find({}, { projection: { ImageBase64: 0 } }).sort({ "InsertedTime": -1 }).toArray();  //
            //  console.log("Formulations: ", Formulations);
            resolve(Formulations)
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let Categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
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
    GetUpdatesFormulaByFileNo: (FileNo) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ "FileNo": FileNo });
            resolve(Formula);
        })
    },
    TinterCheckStock: (TinterName, TinterQty, Branch) => {
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
                var FoundBranchStock = false;
                if (Tinter.BranchStocks) {

                    Tinter.BranchStocks.forEach((OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            FoundBranchStock = true;
                            if (parseInt(OneBranch.Stock) > (TinterQty / 1000)) {
                                State.HaveStock = true;
                                State.AvailableStock = parseFloat(OneBranch.Stock);
                            } else {
                                // TinterQty is more than avalialable Stock
                                console.log("low stock because TinterQty is more than avalialable Stock!")
                                State.HaveStock = false;
                                State.AvailableStock = parseFloat(OneBranch.Stock);
                            }
                        }
                    })
                }

                if (!FoundBranchStock) {
                    console.log("low stock because no Branch stock found!")
                    State.HaveStock = false;
                }
            } else {
                // TinterQty is more than avalialable Stock
                console.log("low stock because no tiner")
                State.HaveStock = false;
                // State.AvailableStock = parseFloat(Tinter.Stock);
            }

            resolve(State);
        })
    },
    BinderCheckStock: (BinderName, BinderQTY, Branch) => {

        var State = {
            HaveStock: false,
            AvailableStock: 0
        }

        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": BinderName });
            BinderQTY = parseFloat(BinderQTY);
            if (Binder) {
                var BranchFound = false;
                if (Binder.BranchStocks) {

                    Binder.BranchStocks.forEach((OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            if (parseFloat(OneBranch.Stock) > (BinderQTY / 1000)) {
                                // have Stock for this formula
                                BranchFound = true;
                                State.HaveStock = true;
                                State.AvailableStock = parseFloat(OneBranch.Stock);
                            } else {
                                // TinterQty is more than avalialable Stock
                                State.HaveStock = false;
                                State.AvailableStock = parseFloat(OneBranch.Stock);
                            }
                        }
                    })
                }

                if (!BranchFound) {
                    State.HaveStock = false;
                }

            } else {
                State.HaveStock = false;
            }
            resolve(State);
        })
    },
    AdditiveCheckStock: (AdditiveName, AdditiveQTY, Branch) => {
        // console.log("AdditiveQTY: ",AdditiveQTY);
        var State = {
            HaveStock: false,
            AvailableStock: 0
        }

        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Name": AdditiveName });
            AdditiveQTY = parseFloat(AdditiveQTY);

            if (Additive) {
                var BranchFound = false;
                if (Additive.BranchStocks) {

                    Additive.BranchStocks.forEach((OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            if (parseFloat(OneBranch.Stock) > (AdditiveQTY / 1000)) {
                                // have Stock for this formula
                                BranchFound = true;
                                State.HaveStock = true;
                                State.AvailableStock = parseFloat(OneBranch.Stock);
                            } else {
                                // TinterQty is more than avalialable Stock
                                State.HaveStock = false;
                                State.AvailableStock = parseFloat(OneBranch.Stock);
                            }
                        }
                    })
                }

                if (!BranchFound) {
                    State.HaveStock = false;
                }

            } else {
                State.HaveStock = false;
            }

            resolve(State);
        })
    },

    BulkOrderUpdate: (OrderFile, Branch) => {
        return new Promise(async (resolve, reject) => {
            try {
                // console.log("OrderFile From Helpers: ", OrderFile);
                var TinterCount = parseInt(OrderFile.TinterCount);

                OrderFile.InsertedTime = Date.now();
                await db.get().collection(collection.BULK_ORDER_COLLECTION).insertOne(OrderFile);

                // Update Product stock
                for (let i = 1; i <= TinterCount; i++) {
                    var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": OrderFile[`TineterName${i}`] });
                    Product.BranchStocks.forEach(async (OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            OneBranch.Stock = parseFloat(OneBranch.Stock) - (parseFloat(OrderFile[`TinterGram${i}`]) / 1000);
                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Name": OrderFile[`TineterName${i}`] }, { $set: { BranchStocks: Product.BranchStocks } });
                        }
                    })
                }

                // Update Binder Stock
                if (OrderFile.Binder1) {
                    var Binder1 = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": OrderFile.Binder1 });
                    Binder1.BranchStocks.forEach(async (OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            OneBranch.Stock = parseFloat(OneBranch.Stock) - (parseFloat(OrderFile.Binder1QTY) / 1000);
                            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Name": OrderFile.Binder1 }, { $set: { BranchStocks: Binder1.BranchStocks } });
                        }
                    })
                    // var BindersOldStock = parseFloat(Binder1.Stock);
                    // var BindersNewStock = BindersOldStock - parseFloat(OrderFile.Binder1QTY);
                    // await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Name": OrderFile.Binder1 }, { $set: { Stock: BindersNewStock } });
                }

                if (OrderFile.Binder2) {
                    var Binder2 = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Name": OrderFile.Binder2 });
                    Binder2.BranchStocks.forEach(async (OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            OneBranch.Stock = parseFloat(OneBranch.Stock) - (parseFloat(OrderFile.Binder2QTY) / 1000);
                            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Name": OrderFile.Binder2 }, { $set: { BranchStocks: Binder2.BranchStocks } });
                        }
                    })
                    // var BindersOldStock = parseFloat(Binder2.Stock);
                    // var BindersNewStock = BindersOldStock - parseFloat(OrderFile.Binder2QTY);
                    // await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Name": OrderFile.Binder2 }, { $set: { Stock: BindersNewStock } });
                }

                if (OrderFile.Additive) {
                    var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Name": OrderFile.Additive });
                    Additive.BranchStocks.forEach(async (OneBranch) => {
                        if (OneBranch.BranchName === Branch) {
                            OneBranch.Stock = parseFloat(OneBranch.Stock) - (parseFloat(OrderFile.AdditiveQTY) / 1000);
                            await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Name": OrderFile.Additive }, { $set: { BranchStocks: Additive.BranchStocks } });
                        }
                    })
                    // var AdditiveOldStock = parseFloat(Additive.Stock);
                    // var AdditiveNewStock = AdditiveOldStock - parseFloat(OrderFile.AdditiveQTY);
                    // await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Name": OrderFile.Additive }, { $set: { Stock: AdditiveNewStock } });
                }

                resolve(); // Resolve the promise after all operations are completed
            } catch (error) {
                reject(error);
            }
        });
    },
    UpdateProductStockById: (Data, Branch) => {
        return new Promise(async (resolve, reject) => {
            var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Id": parseInt(Data.ProductId) })
            if (Product.BranchStocks) {
                Product.BranchStocks.forEach(async (OneBranch) => {
                    if (OneBranch.BranchName === Branch) {
                        OneBranch.Stock = parseFloat(OneBranch.Stock) + (parseFloat(Product.StandardQuatity) * (parseFloat(Data.NewStock)));
                        if (OneBranch.Stock >= 0) {
                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: Product.BranchStocks } });
                        }
                        // await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Name": OrderFile[`TineterName${i}`] }, { $set: { BranchStocks: Product.BranchStocks } });
                    } else {
                        var BranchData = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: Branch })
                        var OneBranch = {
                            BranchName: Branch,
                            BranchID: BranchData._id.toString(),
                            Stock: parseFloat(Product.StandardQuatity) * parseFloat(Data.NewStock),
                        }
                        Product.BranchStocks.push(OneBranch)
                        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: Product.BranchStocks } });
                    }
                })
            } else {
                var BranchStocks = [];
                var BranchData = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: Branch })
                var OneBranch = {
                    BranchID: BranchData._id.toString(),
                    BranchName: Branch,
                    Stock: parseFloat(Product.StandardQuatity) * (parseFloat(Data.NewStock))
                }
                BranchStocks.push(OneBranch);
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: BranchStocks } });
            }

            // var OldStock = parseFloat(Product.Stock);
            // var NewStock = OldStock + (parseFloat(Product.StandardQuatity) * (parseFloat(Data.NewStock)));
            // if (NewStock >= 0) {
            //     await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ "Product_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            // }
            resolve();
        })
    },
    UpdateBinderStockById: (Data, Branch) => {
        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ "Binder_Id": parseInt(Data.ProductId) })
            if (Binder.BranchStocks) {
                Binder.BranchStocks.forEach(async (OneBranch) => {
                    if (OneBranch.BranchName === Branch) {
                        OneBranch.Stock = parseFloat(OneBranch.Stock) + parseFloat(Data.NewStock);
                        if (OneBranch.Stock >= 0) {
                            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: Binder.BranchStocks } });
                        }
                    } else {
                        var BranchData = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: Branch })
                        var OneBranch = {
                            BranchID: BranchData._id.toString(),
                            BranchName: Branch,
                            Stock: parseFloat(Data.NewStock)
                        }
                        Binder.BranchStocks.push(OneBranch)
                        if (OneBranch.Stock >= 0) {
                            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: Binder.BranchStocks } });
                        }
                    }
                })
            } else {
                var BranchStocks = [];
                var BranchData = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: Branch })
                var OneBranch = {
                    BranchID: BranchData._id.toString(),
                    BranchName: Branch,
                    Stock: parseFloat(Data.NewStock)
                }
                BranchStocks.push(OneBranch);
                if (OneBranch.Stock >= 0) {
                    await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: BranchStocks } });
                }
            }
            // var OldStock = parseFloat(Binder.Stock);
            // var NewStock = OldStock + (parseFloat(Data.NewStock));
            // if (NewStock >= 0) {
            //     await db.get().collection(collection.BINDER_COLLECTION).updateOne({ "Binder_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            // }
            resolve();
        })
    },
    UpdateAdditiveStockById: (Data, Branch) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ "Additive_Id": parseInt(Data.ProductId) })
            if (Additive.BranchStocks) {
                Additive.BranchStocks.forEach(async (OneBranch) => {
                    if (OneBranch.BranchName === Branch) {
                        OneBranch.Stock = parseFloat(OneBranch.Stock) + parseFloat(Data.NewStock);
                        if (OneBranch.Stock >= 0) {
                            await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: Additive.BranchStocks } });
                        }
                    } else {
                        var BranchData = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: Branch })
                        var OneBranch = {
                            BranchID: BranchData._id.toString(),
                            BranchName: Branch,
                            Stock: parseFloat(Data.NewStock)
                        }
                        Additive.BranchStocks.push(OneBranch)
                        if (OneBranch.Stock >= 0) {
                            await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: Additive.BranchStocks } });
                        }
                    }
                })
            } else {
                var BranchStocks = [];
                var BranchData = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: Branch })
                var OneBranch = {
                    BranchID: BranchData._id.toString(),
                    BranchName: Branch,
                    Stock: parseFloat(Data.NewStock)
                }
                BranchStocks.push(OneBranch);
                if (OneBranch.Stock >= 0) {
                    await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Id": parseInt(Data.ProductId) }, { $set: { BranchStocks: BranchStocks } });
                }
            }

            // var OldStock = parseFloat(Additive.Stock);
            // var NewStock = OldStock + (parseFloat(Data.NewStock));
            // // console.log(NewStock);
            // if (NewStock >= 0) {
            //     await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ "Additive_Id": parseInt(Data.ProductId) }, { $set: { Stock: NewStock } });
            //     resolve();
            // } else {
            // }
            resolve()

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
    GetAllUpdatedToCalCostCustomerById: (FormulaID, customerCategory) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ FileNo: FormulaID });

            // console.log("Formula: ", Formula);

            for (let i = 1; i <= parseInt(Formula.TintersCount); i++) {
                var TinterName = Formula[`TinterNameR${i}`];
                var Tinter = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Name: TinterName });
                console.log("Tineter: ", Tinter);
                console.log("customerCategory: ", customerCategory);

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
    GetAllToCalCostCustomerById: (FormulaID, customerCategory) => {
        return new Promise(async (resolve, reject) => {
            var Formula = await db.get().collection(collection.FORMULA_COLLECTION).findOne({ FileNo: FormulaID });

            // console.log("Formula: ", Formula);

            for (let i = 1; i <= parseInt(Formula.TintersCount); i++) {
                var TinterName = Formula[`TinterNameR${i}`];
                var Tinter = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Name: TinterName });
                console.log("Tineter: ", Tinter);
                console.log("customerCategory: ", customerCategory);

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
    },
    StoreCardData: (cardData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CARD_COLLECTION).insertOne(cardData).then(() => {
                resolve();
            })
        })
    },
    GetSameCardByCardName: (cardName) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                name: cardName,
                Status: false
            }
            await db.get().collection(collection.CARD_COLLECTION).findOne({ name: cardName }).then((card) => {
                if (card) {
                    if (card.name === cardName) {
                        State.Status = true;
                        resolve(State);
                    } else {
                        resolve(State);
                    }
                } else {
                    resolve(State);
                }
            })
        })
    },
    SaveCardIDToOrder: (OrderFileNO, CardID) => {
        return new Promise(async (resolve, reject) => {
            console.log("OrderFile No: ", OrderFileNO, " CardID: ", CardID);
            await db.get().collection(collection.BULK_ORDER_COLLECTION).updateOne({ FileName: OrderFileNO }, { $set: { CardID: CardID } }).then((response) => {
                // console.log("REsponse of updated Order: ", response);
                // resolve();
            })
            var updatedOrder = await db.get().collection(collection.BULK_ORDER_COLLECTION).findOne({ CardID: CardID });
            // console.log("Updated ORdde dara: ", updatedOrder);
            resolve();
        })
    },

    //sales
    StoreModifiedCardBySales: (card) => {
        return new Promise(async (resolve, reject) => {
            card.InsertedTime = Date.now();
            console.log("Modied card: ", card);
            await db.get().collection(collection.SALES_MODIFIED_CARDS).insertOne(card).then((response) => {
                resolve()
            })
        })
    },

    //ofiice

    getCardContactDetails: (CardId) => {
        return new Promise(async (resolve, reject) => {
            console.log("CardId: ", CardId);
            var ContactDetails = await db.get().collection(collection.SALES_MODIFIED_CARDS).findOne({ id: CardId });
            // console.log("ContactDetails: ",ContactDetails);
            resolve(ContactDetails);
        })
    },
    getAllProductionPeople: () => {
        return new Promise(async (resolve, reject) => {
            var ProductionPeople = await db.get().collection(collection.USERS_COLLECTION).find({ Designation: "Production" }).project({ Password: 0 }).toArray();
            resolve(ProductionPeople);
        })
    },
    getOrderIDByCardId: (CardID) => {
        return new Promise(async (resolve, reject) => {
            console.log("CardID: ", CardID);
            await db.get().collection(collection.BULK_ORDER_COLLECTION).findOne({ CardID: CardID }).then((Order) => {
                console.log("BulkOrder: ", Order);
                if (Order) {
                    var InsertedTime = Order.InsertedTime;
                    resolve(InsertedTime);
                }
            })
                .catch(error => {
                    console.error(error)
                    reject(error)
                });
        })
    },


    //dispatcher
    getAllDriverPeople: () => {
        return new Promise(async (resolve, reject) => {
            var Driver = await db.get().collection(collection.USERS_COLLECTION).find({ Designation: "Driver" }).project({ Password: 0 }).toArray();
            resolve(Driver);
        })
    },



    // Management Tool
    CreateNewCard: (data, EmployeeData) => {
        return new Promise(async (resolve, reject) => {

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0, so add 1
            var yy = String(today.getFullYear()).slice(-2); // Get the last 2 digits of the year

            var cardName = `${dd}-${mm}-${yy}-${data.InsertedTime}`;
            console.log("card Name: ", cardName);


            var CardData = {
                Name: cardName,
                FileNo: data.FileName,
                CurrentList: "ORDERS",
                ListArray: [
                    {
                        ListName: "ORDERS",
                        InTIme: Date.now(),
                        InEmployeeName: EmployeeData.UserName,
                        InEmployeeDesignation: EmployeeData.Designation
                    }

                ],
                Branch: EmployeeData.Branch
            }

            await db.get().collection(collection.CARD_COLLECTION).insertOne(CardData).then(async (response) => {
                // add this card to 
                console.log("response", response);
                const insertedIdString = response.insertedId.toString();
                var OrderList = await db.get().collection(collection.LIST_COLLECTION).findOne({ "Name": "ORDERS", "Branch": EmployeeData.Branch });
                if (!OrderList) {
                    //create an Order List
                    OrderList = {
                        Name: "ORDERS",
                        OldCards: [],
                        Branch: EmployeeData.Branch
                    }

                    await db.get().collection(collection.LIST_COLLECTION).insertOne(OrderList).then((OrderResponse) => {

                        resolve();
                    })
                } else {
                    resolve();
                }
            })
        })
    },

    GetAllCardsByListName: (ListName, Branch) => {
        return new Promise(async (resolve, reject) => {
            let Cards = await db.get().collection(collection.CARD_COLLECTION).find({ CurrentList: ListName, Branch: Branch }).toArray();
            resolve(Cards);
        })
    },
    GetAllCards: (BranchName) => {
        return new Promise(async (resolve, reject) => {
            if (BranchName) {
                console.log("Getting cards from Branch ", BranchName);
                let AllCards = await db.get().collection(collection.CARD_COLLECTION).find({ Branch: BranchName }).toArray();
                resolve(AllCards);
            } else {
                let AllCards = await db.get().collection(collection.CARD_COLLECTION).find().toArray();
                resolve(AllCards);
            }
        })
    },
    getAllLists: (Branch) => {
        return new Promise(async (resolve, reject) => {
            let AllList = await db.get().collection(collection.LIST_COLLECTION).find({ Branch: Branch }).toArray();
            resolve(AllList);
        })
    },
    getCardByID: (id) => {
        return new Promise(async (resolve, reject) => {
            let Card = await db.get().collection(collection.CARD_COLLECTION).findOne({ _id: new ObjectId(id) });
            resolve(Card)
        })
    },
    getOfficeSectionList: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.LIST_COLLECTION).findOne({ Name: "OFFICE SECTION" }).then(async (OldOfficeSectionList) => {
                if (OldOfficeSectionList) {
                    resolve(OldOfficeSectionList)
                } else {
                    // create new Office section lits and pass.
                    //create an Order List
                    var OfficeSectionList = {
                        Name: "OFFICE SECTION",
                        OldCards: []
                    }

                    await db.get().collection(collection.LIST_COLLECTION).insertOne(OfficeSectionList).then(async () => {
                        OfficeSectionList = await db.get().collection(collection.LIST_COLLECTION).findOne({ Name: "OFFICE SECTION" });
                        resolve(OfficeSectionList);
                    })
                }
            })

        })
    },
    SaveUpdatedCardBy: (cardData, Id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CARD_COLLECTION).updateOne({ _id: new ObjectId(Id) }, { $set: cardData }).then((response) => {
                console.log("Card Update Status: ", response);
                resolve();
            })
        })
    },
    getBulkOrderInsertedTime: (Fileno) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BULK_ORDER_COLLECTION).findOne({ FileName: Fileno }).then((BulkOrder) => {
                resolve(BulkOrder.InsertedTime);
            })
        })
    },
    CreateForDispatchListIfNot: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.LIST_COLLECTION).findOne({ Name: "FOR DISPATCH" }).then(async (List) => {
                if (!List) {
                    List = {
                        Name: "FOR DISPATCH",
                        OldCards: []
                    }
                    await db.get().collection(collection.LIST_COLLECTION).insertOne(List).then(() => {
                        resolve();
                    })
                } else {
                    resolve();
                }
            })
        })
    },
    moveCardToCustomerCollectionByCardIDAndMovedUser: (CardID, UserData) => {
        return new Promise(async (resolve, reject) => {
            //create a new Customer COllectio if not exist.
            var CustomerCollectionList = await db.get().collection(collection.LIST_COLLECTION).findOne({ Name: "FOR CUSTOMER COLLECTION" });
            if (!CustomerCollectionList) {
                // create a list
                let NewCustomerCollectonList = {
                    Name: `FOR CUSTOMER COLLECTION`,
                    OldCards: [],
                };
                await db.get().collection(collection.LIST_COLLECTION).insertOne(NewCustomerCollectonList);
            }

            var Card = await db.get().collection(collection.CARD_COLLECTION).findOne({ _id: new ObjectId(CardID) });
            Card.CurrentList = "FOR CUSTOMER COLLECTION";
            var OldListArray = Card.ListArray[0];
            OldListArray.OutTime = Date.now();
            OldListArray.OutEmployeeName = UserData.UserName;
            OldListArray.OutEmployeeDesignation = UserData.Designation;

            var NewListArray = {
                ListName: "FOR CUSTOMER COLLECTION",
                InTime: Date.now(),
                InEmployeeName: UserData.UserName,
                InEmployeeDesignation: UserData.Designation
            }

            Card.ListArray.unshift(NewListArray);

            await db.get().collection(collection.CARD_COLLECTION).updateOne({ _id: new ObjectId(CardID) }, { $set: Card }).then((response) => {
                console.log("Card Update Status: ", response);
                resolve();
            })

        })
    },
    getAllUsers: (Branch) => {
        return new Promise(async (resolve, reject) => {
            var Users = await db.get().collection(collection.USERS_COLLECTION).find({ Branch: Branch }).toArray();
            Users.forEach(user => {
                delete user.Password;
            });

            resolve(Users);
        })

    },
    SaveCustomer: (data, SaveUser) => {
        return new Promise(async (resolve, reject) => {
            data.InsertedTime = Date.now();
            data.Branch = SaveUser.Branch;
            data.InsertedUser = SaveUser.UserName;
            var SameCustomerName = await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ Customername: data.Customername });
            if (SameCustomerName) {
                resolve({ Error: "Customer Name Already Exist, Create a Unique one." });
            } else {
                await db.get().collection(collection.CUSTOMER_COLLECTION).insertOne(data).then((response) => {
                    resolve({ response: response.insertedId });
                })
            }
        })
    },
    getAllCustomers: (Branch) => {
        return new Promise(async (resolve, reject) => {
            let Customers = await db.get().collection(collection.CUSTOMER_COLLECTION).find({ Branch: Branch }).toArray();
            resolve(Customers);
        })
    },
    getAllMeasuringUnitOfAllFormulas: (Formulas) => {
        return new Promise(async (resolve, reject) => {
            // Fetch all Subcategories at once
            const subcategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION)
                .find({ SubCategory: { $in: Formulas.map(formula => formula.SubCategoryName) } })
                .toArray();

            // Create a map for quick lookups
            const subcategoryMap = new Map(subcategories.map(subcategory => [subcategory.SubCategory, subcategory]));

            for (let i = 0; i < Formulas.length; i++) {
                const formula = Formulas[i];
                const subcategory = subcategoryMap.get(formula.SubCategoryName);

                if (subcategory && subcategory.Liter) {
                    formula.Unit = "Liter";
                } else {
                    formula.Unit = "Kilogram";
                }
            }

            resolve(Formulas);
            // for (let i = 0; i < Formulas.length; i++) {
            //     const Formula = Formulas[i];
            //     // console.log("Formula: ", Formula);

            //     // this takes a bit of time
            //     const Subcategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION)
            //         .findOne({ SubCategory: Formula.SubCategoryName });

            //     if (Subcategory.Liter) {
            //         Formula.Unit = "Liter";
            //     } else {
            //         Formula.Unit = "Kilogram";
            //     }
            //     //  console.log(Formula);
            // }

            // // do this after the loop ends 
            // resolve(Formulas)
        })
    },
    InsertNewCard: (NewCard) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CARD_COLLECTION).insertOne(NewCard).then((response) => {
                resolve(response.insertedId);
            })
        })
    },
    UpdateCard: (CardData, CardID, Activity) => {
        return new Promise(async (resolve, reject) => {
            var OldCard = await db.get().collection(collection.CARD_COLLECTION).findOne({ _id: new ObjectId(CardID) });
            OldCard.Activity.push(Activity)
            CardData.CardData = OldCard.Activity;
            CardData.Activity = OldCard.Activity;
            console.log("New Updated card: ", CardData);
            await db.get().collection(collection.CARD_COLLECTION).updateOne({ _id: new ObjectId(CardID) }, { $set: CardData }).then(() => {
                resolve(CardID);
            })
        })
    },
    ChangeCardList: (data) => {
        return new Promise(async (resolve, reject) => {
            var OldCard = await db.get().collection(collection.CARD_COLLECTION).findOne({ _id: new ObjectId(data.cardID) });

            OldCard.CurrentList = data.newlistname;
            OldCard.ListArray[0].OutTime = Date.now();
            OldCard.ListArray[0].OutEmployeeName = data.UserName;
            OldCard.ListArray[0].OutEmployeeDesignation = data.Designation;

            OldCard.ListArray.unshift({
                ListName: data.newlistname,
                InTime: Date.now(),
                InEmployeeName: data.UserName,
                InEmployeeDesignation: data.Designation,
            })

            if (data.ProductionPerson) {
                OldCard.ProductionPerson = data.ProductionPerson;
            }
            OldCard.Activity.push(data.Activity)


            delete OldCard._id;
            console.log("OldCard: ", OldCard);


            await db.get().collection(collection.CARD_COLLECTION).updateOne({ _id: new ObjectId(data.cardID) }, { $set: OldCard }).then(() => {
                if (data.newlistname === "DONE TODAY") {
                    //sent whatsapp message

                    whatsappHelper.sendDeliveyMessage(OldCard).then(() => { })
                }
                resolve(data.cardID);
            })
        })
    },
    ChangeCardListByName: (data) => {
        return new Promise(async (resolve, reject) => {
            var OldCard = await db.get().collection(collection.CARD_COLLECTION).findOne({ Name: data.CardName });

            OldCard.CurrentList = data.newlistname;
            OldCard.ListArray[0].OutTime = Date.now();
            OldCard.ListArray[0].OutEmployeeName = data.UserName;
            OldCard.ListArray[0].OutEmployeeDesignation = data.Designation;

            OldCard.ListArray.unshift({
                ListName: data.newlistname,
                InTime: Date.now(),
                InEmployeeName: data.UserName,
                InEmployeeDesignation: data.Designation,
            })
            if (data.ProductionPerson) {
                OldCard.ProductionPerson = data.ProductionPerson;
            }
            OldCard.Activity.push(data.Activity)

            delete OldCard._id;
            console.log("OldCard: ", OldCard);

            var IsList = await db.get().collection(collection.LIST_COLLECTION).findOne({ Name: data.newlistname })

            if (!IsList) {
                let NewList = {
                    Name: data.newlistname,
                    OldCards: [],
                    Branch: OldCard.Branch
                };
                await db.get().collection(collection.LIST_COLLECTION).insertOne(NewList);
            }


            await db.get().collection(collection.CARD_COLLECTION).updateOne({ Name: data.CardName }, { $set: OldCard }).then(async () => {
                if (data.newlistname === "DONE TODAY") {
                    //sent whatsapp message 
                    //CustomerName
                    var Customerdata = await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ Customername: OldCard.CustomerName });

                    whatsappHelper.sendDeliveyMessage(OldCard, Customerdata.Loaction).then(() => { })
                }
                resolve(data.cardID);
            })
        })
    },
    CreateNewLabel: (Color, Label, Branch) => {
        return new Promise(async (resolve, reject) => {
            var LabelData = {
                Color: `#${Color}`,
                Label: Label,
                Branch: Branch
            }
            await db.get().collection(collection.LABEL_COLLECTION).insertOne(LabelData).then(() => {
                resolve();
            })
        })
    },
    getAllLabels: (Branch) => {
        return new Promise(async (resolve, reject) => {
            let labels = await db.get().collection(collection.LABEL_COLLECTION).find({ Branch: Branch }).toArray();
            resolve(labels);
        })
    },
    CreateACopyByCardID: (CardID, UserName, Designation) => {
        return new Promise(async (resolve, reject) => {

            var date = new Date();
            var day = date.getDate().toString().padStart(2, '0');
            var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
            var year = date.getFullYear().toString().slice(-2);
            var SearchOrderID = `${day}-${month}-${year}-`;
            console.log("Searched ID: ", SearchOrderID);

            var AllCards = await db.get().collection(collection.CARD_COLLECTION).find({ "OrderIDNumber": { $regex: `^${SearchOrderID}` } }).toArray();
            console.log('All Cards', AllCards);

            var OldCard = await db.get().collection(collection.CARD_COLLECTION).findOne({ _id: new ObjectId(CardID) });
            OldCard.ListArray = [
                {
                    ListName: 'ORDERS',
                    InTIme: Date.now(),
                    InEmployeeName: UserName,
                    InEmployeeDesignation: Designation
                }
            ];
            OldCard.CurrentList = "ORDERS"


            async function CreateNewOrderID() {
                var date = new Date();
                var day = date.getDate().toString().padStart(2, '0');
                var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
                var year = date.getFullYear().toString().slice(-2);
                var OrderID = `${day}-${month}-${year}-001-`;


                CheckForDuplicateOrderID(OrderID);
            }



            async function CheckForDuplicateOrderID(OrderID) {
                if (AllCards.length > 0) {
                    for (const EachCard of AllCards) {
                        console.log("Checking ID : ", OrderID);
                        if (EachCard.OrderIDNumber === OrderID) {
                            console.log("Increment" + "  " + EachCard.OrderIDNumber + "  " + OrderID);
                            await IncrementOrderID(OrderID);
                            return; // Exit the loop after calling IncrementOrderID
                        }
                    }
                }

                console.log("Store" + "  " + OrderID);
                addNewOrderID(OrderID);
            }

            function IncrementOrderID(OrderID) {
                // Extract the last section
                const lastSection = OrderID.match(/-(\d+)-$/);
                if (lastSection && lastSection[1]) {
                    const currentNumber = parseInt(lastSection[1], 10);
                    if (!isNaN(currentNumber)) {
                        const newLastSection = (currentNumber + 1).toString().padStart(3, '0');
                        const newOrderID = OrderID.replace(/-\d+-$/, '-' + newLastSection + '-');
                        console.log("Old ID: " + OrderID + "  New ID: " + newOrderID);
                        CheckForDuplicateOrderID(newOrderID);
                    } else {
                        console.log("Invalid last section: " + OrderID);
                    }
                } else {
                    console.log("Invalid format: " + OrderID);
                }
                //  CheckForDuplicateOrderID(newOrderID);
            }

            CreateNewOrderID();

            function addNewOrderID(OrderID) {
                console.log("Putting ID", OrderID)
                OldCard.OrderIDNumber = OrderID.toString();
                OldCard.Name = OrderID + OldCard.CustomerName;
            }

            // handle checkItems
            OldCard.CheckListItems.checkItems.forEach((EachItem) => {
                EachItem.State = 'InComplete';
            })

            // handle Activity
            OldCard.Activity = [
                {
                    activity: UserName + ' created card to Orders.',
                    Time: Date.now()
                }
            ]

            // handle Attachments
            var OldID = OldCard._id;

            delete OldCard._id

            console.log(OldCard.CheckListItems);
            console.log("OldCard: ", OldCard);
            await db.get().collection(collection.CARD_COLLECTION).insertOne(OldCard).then((response) => {

                if (OldCard.IsAttachments) {
                    const ImageOldImageName = OldID;
                    const SaveImgName = response.insertedId;
                    const publicFolderPath = path.join(__dirname, '..', 'public');
                    app.use(express.static(publicFolderPath));
                    // Get the path to the public folder.
                    const sourceImagePath = path.join(publicFolderPath, 'images', 'Attachments', `${ImageOldImageName}.jpg`);
                    // console.log(sourceImagePath);
                    const destinationImagePath = path.join(publicFolderPath, 'images', 'Attachments', `${SaveImgName}.jpg`);
                    // console.log(destinationImagePath);

                    if (fs.existsSync(sourceImagePath)) {
                        // Copy the image.  
                        fs.copyFileSync(sourceImagePath, destinationImagePath);
                    } else {
                        console.error('Source Image does not exist.');
                        // Handle the error or provide appropriate feedback to the user.
                    }
                }
                resolve();
            })
        })
    },
    // moveCardToArchived:(CardID,UserNow,Designation)=>{
    //     return new Promise(async(resolve,reject)=>{

    //     })
    // },
    ChangeCardListByCardID: (data) => {
        return new Promise(async (resolve, reject) => {
            var OldCard = await db.get().collection(collection.CARD_COLLECTION).findOne({ _id: new ObjectId(data.CardID) });

            OldCard.CurrentList = data.newlistname;
            OldCard.ListArray[0].OutTime = Date.now();
            OldCard.ListArray[0].OutEmployeeName = data.UserName;
            OldCard.ListArray[0].OutEmployeeDesignation = data.Designation;

            OldCard.ListArray.unshift({
                ListName: data.newlistname,
                InTime: Date.now(),
                InEmployeeName: data.UserName,
                InEmployeeDesignation: data.Designation,
            })
            if (data.ProductionPerson) {
                OldCard.ProductionPerson = data.ProductionPerson;
            }
            OldCard.Activity.push(data.Activity)

            delete OldCard._id;
            console.log("OldCard: ", OldCard);

            await db.get().collection(collection.CARD_COLLECTION).updateOne({ _id: new ObjectId(data.CardID) }, { $set: OldCard }).then(() => {
                resolve(data.cardID);
            })
        })
    },
    StoreCustomerFollowUP: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_FOLLOW_UP).insertOne(data).then(() => {
                resolve();
            })
        })
    },
    GetAllCustomerFollowUp: (Branch) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_FOLLOW_UP).find({ Branch: Branch }).toArray().then((Data) => {
                resolve(Data);
            })
        })
    },
    GetAllCustomersAndFollowups: (Branch) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_COLLECTION).find({ Branch: Branch }).toArray().then(async (Customers) => {
                await db.get().collection(collection.CUSTOMER_FOLLOW_UP).find({ Branch: Branch }).toArray().then((AllFollowUPs) => {
                    let Data = {
                        AllCustomer: Customers,
                        AllFollowUP: AllFollowUPs
                    };
                    resolve(Data)
                })
            })


        })
    },
    GetAllPurchasedOrders: (Branch) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CARD_COLLECTION).find({ Branch: Branch }).toArray().then((AllOrders) => {
                resolve(AllOrders);
            })
        })
    },
    getAllCustomerPurchaseDataByName: (CustomerName) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_PURCHASE_COLLECTION).find({ CustomerName: CustomerName }).toArray().then((AllData) => {
                resolve(AllData);
            })
        })
    },
    ChangeEmployeeDutyState: (employeeName, OnDutyStateChange) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).updateOne({ UserName: employeeName }, { $set: { OnDuty: OnDutyStateChange } }).then(() => {
                resolve();
            })
        })
    },
    UpdateCardProductionItemState: (CardName, ItemName, State) => {
        return new Promise(async (resolve, reject) => {
            var CardData = await db.get().collection(collection.CARD_COLLECTION).findOne({ "Name": CardName });

            if (CardData) {
                await CardData.CheckListItems.checkItems.forEach((EachCheckItem) => {
                    if (EachCheckItem.Name === ItemName) {
                        EachCheckItem.State = State;
                    }
                })

                await db.get().collection(collection.CARD_COLLECTION).updateOne({ "Name": CardName }, { $set: CardData }).then(() => {
                    resolve();
                })

            } else {
                resolve()
            }
        })
    },
    getAllProductGroups: () => {
        return new Promise(async (resolve, reject) => {
            var AllGroup = await db.get().collection(collection.PRODUCT_GROUP_COLLECTION).find().toArray();
            resolve(AllGroup);
        })
    },


    // convert all cards to East cost DC branch
    GiveAllCardABranch: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_FOLLOW_UP).updateMany({}, { $set: { Branch: "East cost DC" } });
            resolve()
        })
    }

}
