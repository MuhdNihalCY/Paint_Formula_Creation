var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');


module.exports = {
    AddCategory: (data) => {
        return new Promise(async (resolve, reject) => {

            // Daclare State of the process
            var State = {};
            //  console.log(collection.CATEGORY_COLLECTION);
            // first check whether the category is already entered in the database
            var SameCatagory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ "Category": data.Category })
            //console.log(SameCatagory);
            if (SameCatagory) {
                // if the category is already entered, return the category id
                State.Status = false
                State.error = "This Category is Already in Database"
                resolve(State);
            } else {
                // insert this data to database
                // console.log(Date.now())
                // find Last added Category
                var LastAddedCategory = await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray()
                //  console.log(LastAddedCategory);

                if (LastAddedCategory.length > 0) {
                    LastAddedCategory = LastAddedCategory[0];
                    var CategoryData = {
                        "Category_Id": LastAddedCategory.Category_Id + 1,
                        "Category": data.Category,
                        "InsertedTime": Date.now()
                    }
                    insertCategory(CategoryData);
                } else {
                    var CategoryData = {
                        "Category_Id": 100,
                        "Category": data.Category,
                        "InsertedTime": Date.now()
                    }
                    insertCategory(CategoryData)
                }

                // function for insert Data to Database
                async function insertCategory(CategoryData) {
                    await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(CategoryData).then((response) => {
                        // console.log(response);
                        if (response.acknowledged) {
                            // insert of data is completed
                            State.Status = true
                        } else {
                            // error occured while inserting data
                            State.Status = false
                            State.error = "Error occured while inserting to Database"
                        }
                        resolve(State);
                    })
                }

            }
        })
    },
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            var Category = await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({ "InsertedTime": 1 }).toArray();
            // console.log(Category);
            resolve(Category);
        })
    },
    DeleteCategory: (id) => {
        return new Promise(async (resolve, reject) => {
            // console.log("Going to delete category with id", id);
            var State = { Status: false, error: "" }

            var Subcategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find({ Category_Id: id }).toArray();
            if (Subcategories.length > 0) {
                State.error = "Category Must be empty before deleting the Category. ie, no Subcategory Should be avalailable under this Category."
                resolve(State);
            } else {
                await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ "Category_Id": parseInt(id) }).then((response) => {
                    // console.log(response);
                    if (response.deletedCount) {
                        State.Status = true;
                    } else {
                        State.error = "Category Not Deleted, Try Again. "
                        State.Status = false;
                    }
                    resolve(State);
                })
            }
        })
    },
    AddSubCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            // to check the subcategory is already added to database
            var SameCatagory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ "SubCategory": data.SubCategory });
            if (SameCatagory) {
                // already Subcategory Added
                var State = { Status: false, error: "Sub Category " + data.SubCategory + " is already in Database" }
                resolve(State)
            } else {
                // get latest Inserted SubCategory
                var InsertedSubCategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray();
                // console.log(InsertedSubCategories);
                if (InsertedSubCategories.length > 0) {
                    var latestInsertSubCategory = InsertedSubCategories[0];
                    data.SubCategory_Id = latestInsertSubCategory.SubCategory_Id + 1;
                } else {
                    data.SubCategory_Id = 1000;
                }

                data.InsertedTime = Date.now();
                //  console.log("Going to add Sub Category", data);
                var State = { Status: false, error: "" }
                data.Products = [];
                await db.get().collection(collection.SUB_CATEGORY_COLLECTION).insertOne(data).then((response) => {
                    //  console.log(response);
                    if (response.insertedId) {
                        State.Status = true;
                    } else {
                        State.Status = false;
                        State.error = "Sub Category is not Added, Try Again."
                    }
                    resolve(State);
                })
            }
        })
    },
    EditSubcategoryBy: (data) => {
        return new Promise(async (resolve, reject) => {
            State = {
                status: false,
                err: ''
            }

            await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateOne({ "SubCategory": data.SubCategory }, {
                $unset: {
                    Gram: "", Liter: "", Gloss: "", Matt: "", Binder1: "", Binder2: ""
                }
            }).then((response) => {
                //  console.log(response);
            })

            await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateOne({ "SubCategory": data.SubCategory }, { $set: data }).then((response) => {
                //  console.log(response);
                resolve(response);
            })
        })
    },
    GetAllSubCategory: () => {
        return new Promise(async (resolve, reject) => {
            var SubCategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().sort({ "InsertedTime": 1 }).toArray()
            resolve(SubCategories);
        })
    },
    getSubCategoryByCategoryId: (id) => {
        return new Promise(async (resolve, reject) => {
            var SubCategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find({ Category_Id: id }).sort({ "InsertedTime": 1 }).toArray()
            resolve(SubCategories);
        })
    },
    getSubCategoryById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Subcategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ "SubCategory_Id": parseInt(id) });
            // console.log(Subcategory);
            resolve(Subcategory);
        })
    },
    addProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            var SameProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": data.Product_Name });
            // console.log(SameProduct);
            var State = {
                Status: false,
                error: false
            }

            if (!SameProduct) {

                var SameProductID = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Id": data.Product_Id });
                if (!SameProductID) {
                    data.InsertedTime = Date.now();

                    var latestProductAdded = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray()
                    // console.log(latestProductAdded);

                    // if (latestProductAdded.length > 0) {
                    //     latestProductAdded = latestProductAdded[0];
                    //     data.Product_Id = parseInt(latestProductAdded.Product_Id) + 1;
                    // } else {
                    //     data.Product_Id = 10000;
                    // } 
                    //Product_Collection

                    var SubCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ SubCategory_Id: parseInt(data.SubCategory) });
                    console.log(data);
                    console.log(SubCategory);
                    var ProductsArrayInSubcategory = SubCategory.Products;
                    var ProductId = data.Product_Id;
                    // Check if the product ID is present in the array
                    var isPresent = ProductsArrayInSubcategory.includes(ProductId);

                    // Output the result
                    if (isPresent) {
                        // Already Product added to subcategory
                        State.Status = false;
                        State.error = "Product is Already added to subcategory";
                        // console.log("Product ID", pId, "is present in the array.");
                    } else {
                        // console.log("Product ID", pId, "is not present in the array.");
                        ProductsArrayInSubcategory.push(ProductId);
                        console.log(SubCategory);
                        // remove Category and subcategory from data
                        delete data.Category;
                        delete data.SubCategory;

                        console.log("Product to Insert: ", data);
                        await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(data).then((response) => {
                            if (response.insertedId) {
                                UpdateProductsArray(SubCategory)
                                State.Status = true;
                                console.log("Product Added");
                            } else {
                                State.Status = false;
                                State.error = "Product is not Added, Try Again."
                            }
                        })
                    }
                } else {
                    State.error = "Product ID Already Exists."
                }

            } else {
                State.error = "Product Already Exists."
            }

            async function UpdateProductsArray(SubCategory) {
                await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateOne({ SubCategory_Id: SubCategory.SubCategory_Id }, {
                    $set: {
                        Products: SubCategory.Products
                    }
                })
            }

            resolve(State);
        })
    },
    // this method is no using 
    // remove this.***
    // GetProduct: (id) => {
    //     return new Promise(async (resolve, reject) => {
    //         var Product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ SubCategory: id }).toArray();
    //         resolve(Product);
    //     })
    // },
    getAllProductsByArrayOfId: (ArrayOfPId) => {
        return new Promise(async (resolve, reject) => {

            const productPromises = ArrayOfPId.map(async (productId) => {
                const product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(productId) });
                return product;
            });

            const productList = await Promise.all(productPromises);
            console.log("Product List : ", productList);
            resolve(productList);
        })
    },
    GetAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            var products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    },
    GetProductByID: (id) => {
        return new Promise(async (resolve, reject) => {
            //  console.log(id);
            var product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(id) });
            resolve(product);
        })
    },
    GetProductByName: (ProductName) => {
        return new Promise(async (resolve, reject) => {
            var Product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Name: ProductName });
            resolve(Product);
        })
    },
    UpdateProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            // console.log(data);
            var State = {
                Status: false,
                error: ""
            }
            // console.log(data.Product_Name)
            var SameProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(data.OldProduct_Id) });
            // console.log(SameProduct);
            if (SameProduct) {

                // Stock: parseFloat(data.Stock) * parseFloat(data.StandardQuatity)
                data.Stock = parseFloat(data.Stock) * parseFloat(data.StandardQuatity)
                data.Product_Id = parseInt(data.Product_Id);

                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    { _id: SameProduct._id },
                    {
                        $set: data
                    }
                ).then((response) => {
                    // console.log(response);
                    if (response.acknowledged) {
                        State.Status = true;
                    }

                });


                // update in subcategory  collection
                var Subcategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find({
                    Products: {
                        $in: [parseInt(data.OldProduct_Id)]
                    }
                }).toArray();


                console.log("Old Product ID: ", data.OldProduct_Id);
                console.log("Old Product ID Subcategories: ", Subcategories);

                // Find the index of the subcategory containing data.OldProduct_Id
                const oldProductIndex = Subcategories.findIndex(subcategory => subcategory.Products.includes(parseInt(data.OldProduct_Id)));

                if (oldProductIndex !== -1) {
                    // Remove data.OldProduct_Id from the Products array
                    Subcategories[oldProductIndex].Products = Subcategories[oldProductIndex].Products.filter(id => id !== parseInt(data.OldProduct_Id));

                    // Add data.NewProductID to the Products array
                    Subcategories[oldProductIndex].Products.push(data.Product_Id);
                }

                console.log("Old Product ID Modified Subcategories: ", Subcategories);



                resolve(State);
            }

        })
    },
    DeleteProductById: (id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

            // remove This product from all Subcategories

            var Subcategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateMany(
                { Products: parseInt(id) },
                { $pull: { Products: parseInt(id) } }
            )
            // delete product details
            await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ Product_Id: parseInt(id) }).then((response) => {
                // console.log(response)
                if (response.deletedCount) {
                    State.Status = true
                } else {
                    State.error = "Product Id Not Found"
                }
                resolve(State);
            })
        })
    },
    CopyProductById: (id, data) => {
        return new Promise(async (resolve, reject) => {
            //console.log(data)
            var Status = {
                State: false,
                Error: "",
            }
            var SubCategory_Id = parseInt(data.SubCategory);
            var SubCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ SubCategory_Id: SubCategory_Id });

            // Check if SubCategory.Products is an array and initialize it if not
            if (!Array.isArray(SubCategory.Products)) {
                console.log("Make it into an Array");
                SubCategory.Products = [];
            }

            // check for id
            if (!SubCategory.Products.includes(parseInt(id))) {
                SubCategory.Products.push(parseInt(id));
                await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateOne({ SubCategory_Id: SubCategory_Id }, {
                    $set: {
                        Products: SubCategory.Products
                    }
                }).then(() => {
                    console.log("ID added successfully.");
                    Status.State = true
                    resolve(Status);
                })
            } else {
                console.log("ID already exists in the array.");
                Status.Error = "Product Already Present in that Subcategory : " + SubCategory.SubCategory;
                resolve(Status);
            }

        })
    },
    RemoveProductFromSubcategory: (Subcategory_Id, ProductId) => {

        return new Promise(async (resolve, reject) => {
            // remove This product from all Subcategories

            await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateMany(
                { SubCategory_Id: parseInt(Subcategory_Id) },
                { $pull: { Products: parseInt(ProductId) } }
            ).then(() => {
                resolve();
            })
        })
    },
    AddAdditives: (data) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }
            var SameAdditive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ Additive_Name: data.Additive_Name });
            if (!SameAdditive) {
                data.InsertedTime = Date.now();
                var latestAdditive = await db.get().collection(collection.ADDITIVE_COLLECTION).find().sort({ InsertedTime: -1 }).toArray();
                if (latestAdditive.length > 0) {
                    latestAdditive = latestAdditive[0];
                    data.Additive_Id = parseInt(latestAdditive.Additive_Id) + 1;
                } else {
                    data.Additive_Id = 1000;
                }
                await db.get().collection(collection.ADDITIVE_COLLECTION).insertOne(data).then((respones) => {
                    if (respones.insertedId) {
                        State.Status = true;
                    } else {
                        State.error = "Additive Not Added!"
                    }
                })
            } else {
                State.error = "This Additive Already Added!"
            }
            resolve(State);
        })
    },
    GetAllAdditives: () => {
        return new Promise(async (resolve, reject) => {
            var Additives = await db.get().collection(collection.ADDITIVE_COLLECTION).find().toArray();
            resolve(Additives);
        })
    },
    DeleteAdditiveById: (id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

            await db.get().collection(collection.ADDITIVE_COLLECTION).deleteOne({ Additive_Id: parseInt(id) }).then((respone) => {
                if (respone.deletedCount) {
                    State.Status = true;
                } else {
                    State.error = "Additive Not Deleted!"
                }
                resolve(State);
            })
        })
    },
    getAdditiveById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ Additive_Id: parseInt(id) })
            resolve(Additive);
        })
    },
    getAdditiveByName: (Additive_name) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ Additive_Name: Additive_name });
            resolve(Additive);
        })
    },
    UpdateAdditive: (data) => {
        // Product_Id: '1000',
        return new Promise(async (resolve, reject) => {
            console.log(data);
            data.Additive_Id = parseInt(data.Additive_Id);
            // delete data.Product_Id

            await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ Additive_Id: data.Additive_Id }, {
                $set: data
            }).then(Response => {
                console.log(Response);
                resolve(Response);
            })
        })
    },
    AddBinders: (data) => {
        return new Promise(async (resolve, reject) => {
            // console.log(data);
            var State = {
                Status: false,
                error: ""
            }
            var SameBinder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Name: data.Binder_Name });
            if (SameBinder) {
                // console.log("Same Binder: ",SameBinder);
                State.error = "This Binder Already Added!"
            } else {
                data.InsertedTime = Date.now();
                var latestBinder = await db.get().collection(collection.BINDER_COLLECTION).find().sort({ InsertedTime: -1 }).toArray();
                if (latestBinder.length > 0) {
                    latestBinder = latestBinder[0];
                    data.Binder_Id = parseInt(latestBinder.Binder_Id) + 1;
                } else {
                    data.Binder_Id = 1000;
                }
                await db.get().collection(collection.BINDER_COLLECTION).insertOne(data).then((respones) => {
                    if (respones.insertedId) {
                        State.Status = true;
                    } else {
                        State.error = "Binder Not Added!"
                    }
                })
            }
            resolve(State);
        })
    },
    GetAllBinders: () => {
        return new Promise(async (resolve, reject) => {
            var Binders = await db.get().collection(collection.BINDER_COLLECTION).find().toArray();
            resolve(Binders);
        })
    },
    DeleteBinderById: (id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }
            await db.get().collection(collection.BINDER_COLLECTION).deleteOne({ Binder_Id: parseInt(id) }).then((response) => {
                if (response.deletedCount) {
                    State.Status = true;
                } else {
                    State.error = "Binder Not Deleted!"
                }
                resolve(State)
            })
        })
    },
    GetBinderByname: (BinderName) => {
        return new Promise(async (resolve, reject) => {
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Name: BinderName });
            resolve(Binder);
        })
    },
    UpdateBinder: (data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data);
            data.Binder_Id = parseInt(data.Binder_Id);

            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ Binder_Id: data.Binder_Id }, {
                $set: data
            }).then(Response => {
                console.log(Response);
                resolve(Response);
            })
        })
    },
    AddEmployee: (data) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

            var latestEmployee = await db.get().collection(collection.EMPLOYEE_COLLECTION).find().sort({ InsertedTime: -1 }).toArray();

            data.InsertedTime = Date.now();

            if (latestEmployee.length > 0) {
                var latestEmployee = latestEmployee[0];
                if (latestEmployee) {
                    data.Employee_Id = latestEmployee.Employee_Id + 1;
                }
            } else {
                data.Employee_Id = 100;
            }

            await db.get().collection(collection.EMPLOYEE_COLLECTION).insertOne(data).then((response) => {
                if (response.insertedId) {
                    State.Status = true;
                } else {
                    State.error = "Employee Not Added!"
                }
                resolve(State)
            })
        })
    },
    GetAllEmployees: () => {
        return new Promise(async (resolve, reject) => {
            var Employees = await db.get().collection(collection.EMPLOYEE_COLLECTION).find().toArray();
            resolve(Employees)
        })
    },
    GetEmployeeById: (id) => {
        // console.log(id);
        return new Promise(async (resolve, reject) => {
            var Employee = await db.get().collection(collection.EMPLOYEE_COLLECTION).findOne({ Employee_Id: parseInt(id) });
            resolve(Employee);
        })
    },
    UpdateEmployee: (data, id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

            await db.get().collection(collection.EMPLOYEE_COLLECTION).updateOne({ Employee_Id: parseInt(id) }, { $set: data }).then((response) => {
                // console.log(response);
                if (response.modifiedCount > 0) {
                    State.Status = true;
                } else {
                    State.error = "Employee Not Updated!";
                }
                resolve(State);
            })
        })
    },
    DeleteEmployeeById: (id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }
            await db.get().collection(collection.EMPLOYEE_COLLECTION).deleteOne({ Employee_Id: parseInt(id) }).then((response) => {
                if (response.deletedCount) {
                    State.Status = true;
                } else {
                    State.error = "Employee Not Deleted!"
                }
                resolve(State)
            })
        })
    },
    AddCustomer: (data) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

            var latestCustomer = await db.get().collection(collection.CUSTOMER_COLLECTION).find().sort({ InsertedTime: -1 }).toArray();

            data.InsertedTime = Date.now();

            if (latestCustomer.length > 0) {
                var latestCustomer = latestCustomer[0];
                if (latestCustomer) {
                    data.Customer_Id = latestCustomer.Customer_Id + 1;
                }
            } else {
                data.Customer_Id = 100;
            }

            await db.get().collection(collection.CUSTOMER_COLLECTION).insertOne(data).then((response) => {
                if (response.insertedId) {
                    State.Status = true;
                } else {
                    State.error = "Customer Not Added!"
                }
                resolve(State)
            })
        })
    },
    getAllCustomers: () => {
        return new Promise(async (resolve, reject) => {
            var Customers = await db.get().collection(collection.CUSTOMER_COLLECTION).find().toArray();
            resolve(Customers);
        })
    },
    GetCustomerById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Customer = await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ Customer_Id: parseInt(id) });
            resolve(Customer);
        })
    },
    UpdateCustomer: (data, id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

            await db.get().collection(collection.CUSTOMER_COLLECTION).updateOne({ Customer_Id: parseInt(id) }, { $set: data }).then((response) => {
                // console.log(response);
                if (response.modifiedCount > 0) {
                    State.Status = true;
                } else {
                    State.error = "Customer Not Updated!";
                }
                resolve(State);
            })
        })
    },
    DeleteCustomerById: (id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }
            await db.get().collection(collection.CUSTOMER_COLLECTION).deleteOne({ Customer_Id: parseInt(id) }).then((response) => {
                if (response.deletedCount) {
                    State.Status = true;
                } else {
                    State.error = "Employee Not Deleted!"
                }
                resolve(State)
            })
        })
    },
    AdminPasswordChange: (data, AdminUser) => {
        return new Promise(async (resolve, reject) => {
            var CurrentPassword = data.CurrentPassword
            var Newpassword = data.Newpassword1


            var IsAdmin = await db.get().collection(collection.ADMIN_COLLECTION).findOne();
            // console.log("IsAdmin", IsAdmin);
            var Admin = {
                name: "Admin",
                password: Newpassword
            };
            // console.log("New Data: ", Admin);

            if (IsAdmin) {
                // check password mathced and update
                // Already changed the password One Time
                if (IsAdmin.password === CurrentPassword) {
                    //Old Passwprd matches
                    await db.get().collection(collection.ADMIN_COLLECTION).updateOne({ "password": CurrentPassword }, { $set: Admin }).then((response) => {
                        // console.log("password Updated in database")
                        if (response.modifiedCount) {
                            resolve({ Status: true })
                        } else {
                            resolve({ Status: false, err: "Password not updated!" })
                        }
                    })
                } else {
                    // Old passswrod doesn't match
                    resolve({ Status: false, err: "Old Passwrod doesn't match. Password not updated!" })
                }
            } else {
                // change the password for first Time

                if (AdminUser.password === CurrentPassword) {
                    await db.get().collection(collection.ADMIN_COLLECTION).insertOne(Admin).then((response) => {
                        // console.log(response.insertedId);
                        // console.log("Password Added to database!");
                        if (response.insertedId) {
                            resolve(response.insertedId)
                        } else {
                            resolve({ Status: false, err: "Password not Changed!" })
                        }
                    })
                } else {
                    resolve({ Status: false, err: "Old Passwrod doesn't match. Password not updated!" })
                }

            }
        })
    },
    AdminLogin: (data, AdminUser) => {
        return new Promise(async (resolve, reject) => {
            var IsAdmin = await db.get().collection(collection.ADMIN_COLLECTION).findOne();
            // console.log("IsAdmin", IsAdmin);

            if (IsAdmin) {
                // admin Data already in database
                if (IsAdmin.name == data.userName && IsAdmin.password == data.password) {
                    // Good Login Input
                    resolve({ Status: true });
                } else {
                    // wrong login input
                    resolve({ Status: false, err: "Wrong login credentials" })
                }
            } else {
                // admin data not on database
                if (AdminUser.userName == data.userName && AdminUser.password == data.password) {
                    // Good Login Input
                    resolve({ Status: true });
                } else {
                    // wrong login input
                    resolve({ Status: false, err: "Wrong login credentials" })
                }
            }
        })
    },
    addCustomerCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            var latestCategory = await db.get().collection(collection.CUSTOMER_CATETGORY_COLLECTION).find().sort({ InsertedTime: -1 }).toArray();
            console.log(latestCategory);
            latestCategory = latestCategory[0];

            var SameCategory = await db.get().collection(collection.CUSTOMER_CATETGORY_COLLECTION).find({ Category: data.Category }).toArray();
            if (SameCategory.length > 0) {
                //Category with same name already avalible.
                resolve({ status: false, message: `Category ${latestCategory.Category} is Already Avaliable`, Error: 'Already Added!' });
            } else {
                //store the category
                if (latestCategory) {
                    var Id = parseInt(latestCategory.Id) + 1;
                    data.Id = Id;
                    await db.get().collection(collection.CUSTOMER_CATETGORY_COLLECTION).insertOne(data).then((Response) => {
                        resolve({ status: true, message: `Category is Added` });
                    })
                } else {
                    data.Id = 1000;
                    await db.get().collection(collection.CUSTOMER_CATETGORY_COLLECTION).insertOne(data).then((Response) => {
                        resolve({ status: true, message: `Category is Added` });
                    })
                }
            }
        })
    },
    getAllCustomerCategory: () => {
        return new Promise(async (resolve, reject) => {
            var CustomerCategories = await db.get().collection(collection.CUSTOMER_CATETGORY_COLLECTION).find().toArray();
            resolve(CustomerCategories);
        })
    },
    RemoveCustomerCategoryByName: (Category) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_CATETGORY_COLLECTION).deleteOne({ Category: Category }).then((Response) => {
                resolve(Response);
            })
        })
    },
    AddUser: (UserData) => {
        return new Promise(async (resolve, reject) => {
            // {
            //   UserName: 'sdfasffd',
            //   Designation: 'Employee',
            //   Contact: '3453453456345',
            //   WhatsAppNumber: '3453453456345',
            //   ContactNumberSame: 'on',
            //   AlternateContact: '34634564356'
            // }
            var sameUserName = await db.get().collection(collection.USERS_COLLECTION).findOne({ UserName: UserData.UserName });

            // console.log("Same User", sameUserName); // null or not null
            UserData.InsertedTime = Date.now();
            var LatestUser = await db.get().collection(collection.USERS_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray();

            var State = {
                Status: false,
                Err: false
            }

            if (sameUserName) {
                //Username Already Exist
                console.log("Same Username already Existed");
                State.Err = "Same Username already Existed"
                resolve(State);
            } else {
                // add User

                LatestUser = LatestUser[0];
                if (LatestUser) {
                    var LatestUserID = parseInt(LatestUser.UserID);
                    UserData.UserID = LatestUserID + 1;
                } else {
                    UserData.UserID = 1000;
                }

                console.log("Customer Adding")

                await db.get().collection(collection.USERS_COLLECTION).insertOne(UserData).then((response) => {
                    if (response.insertedId) {
                        State.Status = false
                        resolve(State);
                    } else {
                        State.Err = "Not inserted"
                        resolve(State);
                    }
                })
            }
        })
    },
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let UsersList = await db.get().collection(collection.USERS_COLLECTION).find().toArray();
            resolve(UsersList);
        })
    },
    getUserByID: (UserID) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).findOne({ UserID: parseInt(UserID) }).then((User) => {
                resolve(User)
            })
        })
    },
    updateUser: (UserData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).updateOne({ UserID: UserData.UserID }, { $set: UserData }).then((response) => {
                console.log(response);
                resolve(response);
            })
        })
    },

    //Management Tool
    CreateNewList: (UserName, Branch) => {
        return new Promise(async (resolve, reject) => {
            var ListData = {
                Name: UserName,
                OldCards: [],
                Branch: Branch

            }
            await db.get().collection(collection.LIST_COLLECTION).insertOne(ListData).then((respose) => {
                resolve(respose);
            })
        })
    },
    ValidateAndStoreNewBranch: (data) => {
        return new Promise(async (resolve, reject) => {
            var SameBranch = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ BranchName: data.BranchName });

            if (SameBranch) {
                // Error Same Branch Name Exist
                var State = {
                    Error: "Branch Name already exist."
                }
                resolve(State)
            } else {
                // Store New Branch
                await db.get().collection(collection.BRANCH_COLLECTION).insertOne(data).then((Response) => {
                    resolve(Response);
                })
            }
        })
    },
    GetAllBranches: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BRANCH_COLLECTION).find().toArray().then((GetAllBranches) => {
                resolve(GetAllBranches);
            })
        })
    },
    UpdateBranchDetails: (BranchData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BRANCH_COLLECTION).updateOne({ _id: new ObjectId(BranchData.BranchID) }, {
                $set: {
                    BranchName: BranchData.BranchName,
                    Location: BranchData.Location,
                    Contact: BranchData.Contact
                }
            }).then(() => {
                resolve();
            })
        })
    },
    GetAllInventory: () => {
        return new Promise(async (resolve, reject) => {
            var Products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            var Additives = await db.get().collection(collection.ADDITIVE_COLLECTION).find().toArray();
            var Binders = await db.get().collection(collection.BINDER_COLLECTION).find().toArray();
            var Inventory = {
                Products: Products,
                Additives: Additives,
                Binders: Binders
            }
            resolve(Inventory);
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            var Users = await db.get().collection(collection.USERS_COLLECTION).find().toArray();
            resolve(Users);
        })
    },
    UpdateProductStock: (BranchID, ProductID, NewStock) => {
        return new Promise(async (resolve, reject) => {
            var Branch = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ _id: new ObjectId(BranchID) })
            // console.log(Branch);    //BranchName

            var product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(ProductID) });
            console.log(product);

            if (product.BranchStocks) {
                // already have any Branch stocks here Bracnch stocks is an array of all branches with thier stocks
                var BranchStocks = product.BranchStocks;

                // check for current branch and modify it, if not current branch create it.
                var StockFound = false;

                BranchStocks.forEach(EachStock => {
                    if (EachStock.BranchID === BranchID) {
                        StockFound = true;
                        EachStock.Stock = parseInt(EachStock.Stock) + (parseInt(NewStock) * parseInt(product.StandardQuatity));
                    }
                });

                // Check the flag after the loop is complete
                if (!StockFound) {
                    BranchStocks.push({
                        BranchID: BranchID,
                        BranchName: Branch.BranchName,
                        Stock: parseInt(NewStock) * parseInt(product.StandardQuatity)
                    });
                }


                console.log("Updated ProductStocks: ", product);
                // update in database
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Product_Id: parseInt(ProductID) }, { $set: product }).then(() => {
                    resolve(product);
                })

            } else {
                // no Branch Stocks available
                var BranchStocks = [];
                var ThisBranchStock = {
                    BranchID: BranchID,
                    BranchName: Branch.BranchName,
                    Stock: parseInt(NewStock) * parseInt(product.StandardQuatity)
                }
                BranchStocks.push(ThisBranchStock);

                // update the Product
                product.BranchStocks = BranchStocks;

                console.log("Stock Updated Product: ", product);
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Product_Id: parseInt(ProductID) }, { $set: product }).then(() => {
                    resolve(product);
                })

            }

        })
    },
    UpdateBinderStock: (BranchID, BinderID, NewStock) => {
        return new Promise(async (resolve, reject) => {
            var Branch = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ _id: new ObjectId(BranchID) })
            // console.log(Branch);    //BranchName

            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Id: parseInt(BinderID) });
            console.log(Binder);

            if (Binder.BranchStocks) {
                // already have any Branch stocks here Bracnch stocks is an array of all branches with thier stocks
                var BranchStocks = Binder.BranchStocks;

                // check for current branch and modify it, if not current branch create it.
                var StockFound = false;

                BranchStocks.forEach(EachStock => {
                    if (EachStock.BranchID === BranchID) {
                        StockFound = true;
                        EachStock.Stock = parseInt(EachStock.Stock) + parseInt(NewStock);
                    }
                });

                // Check the flag after the loop is complete
                if (!StockFound) {
                    BranchStocks.push({
                        BranchID: BranchID,
                        BranchName: Branch.BranchName,
                        Stock: parseInt(NewStock)
                    });
                }


                console.log("Updated Binder Stocks: ", Binder);
                // update in database
                await db.get().collection(collection.BINDER_COLLECTION).updateOne({ Binder_Id: parseInt(BinderID) }, { $set: Binder }).then(() => {
                    resolve(Binder);
                })

            } else {
                // no Branch Stocks available
                var BranchStocks = [];
                var ThisBranchStock = {
                    BranchID: BranchID,
                    BranchName: Branch.BranchName,
                    Stock: parseInt(NewStock)
                }
                BranchStocks.push(ThisBranchStock);

                // update the Product
                Binder.BranchStocks = BranchStocks;

                console.log("Stock Updated Binder: ", Binder);
                await db.get().collection(collection.BINDER_COLLECTION).updateOne({ Binder_Id: parseInt(BinderID) }, { $set: Binder }).then(() => {
                    resolve(Binder);
                })

            }

        })
    },
    UpdateAdditiveStock: (BranchID, AdditiveID, NewStock) => {
        return new Promise(async (resolve, reject) => {
            var Branch = await db.get().collection(collection.BRANCH_COLLECTION).findOne({ _id: new ObjectId(BranchID) })
            // console.log(Branch);    //BranchName

            var Additive = await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({ Additive_Id: parseInt(AdditiveID) });
            console.log(Additive);

            if (Additive.BranchStocks) {
                // already have any Branch stocks here Bracnch stocks is an array of all branches with thier stocks
                var BranchStocks = Additive.BranchStocks;

                // check for current branch and modify it, if not current branch create it.
                var StockFound = false;

                BranchStocks.forEach(EachStock => {
                    if (EachStock.BranchID === BranchID) {
                        StockFound = true;
                        EachStock.Stock = parseInt(EachStock.Stock) + parseInt(NewStock);
                    }
                });

                // Check the flag after the loop is complete
                if (!StockFound) {
                    BranchStocks.push({
                        BranchID: BranchID,
                        BranchName: Branch.BranchName,
                        Stock: parseInt(NewStock)
                    });
                }


                console.log("Updated Additive Stocks: ", Additive);
                // update in database
                await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ Additive_Id: parseInt(AdditiveID) }, { $set: Additive }).then(() => {
                    resolve(Additive);
                })

            } else {
                // no Branch Stocks available
                var BranchStocks = [];
                var ThisBranchStock = {
                    BranchID: BranchID,
                    BranchName: Branch.BranchName,
                    Stock: parseInt(NewStock)
                }
                BranchStocks.push(ThisBranchStock);

                // update the Product
                Additive.BranchStocks = BranchStocks;

                console.log("Stock Updated Additive: ", Additive);
                await db.get().collection(collection.ADDITIVE_COLLECTION).updateOne({ Additive_Id: parseInt(AdditiveID) }, { $set: Additive }).then(() => {
                    resolve(Additive);
                })

            }

        })
    },
    deleteUserByUserID: (UserID) => {
        return new Promise(async (resolve, reject) => {
            var User = await db.get().collection(collection.USERS_COLLECTION).findOne({ UserID: parseInt(UserID) });
            User.DeletedTime = Date.now();

            await db.get().collection(collection.DELETED_USERS_COLLECTION).insertOne(User);

            await db.get().collection(collection.USERS_COLLECTION).deleteOne({ UserID: parseInt(UserID) }).then(() => {
                resolve();
            })
        })
    },
    AddBranchToEachDatastoreLedgerData: (LedgerData, CustomerName, UserName, Branch) => {
        return new Promise(async (resolve, reject) => {

            // await LedgerData.TableData.forEach((EachPurchaseData)=>{
            //     EachPurchaseData.Branch = Branch;
            // })

            // await db.get().collection(collection.LEDGER_UPLOADED_DATA).insertOne(LedgerData);
            // // check to avoid dplicates
            // var AllPurchases = await db.get().collection(collection.CUSTOMER_PURCHASE_COLLECTION).find({"Branch":Branch});

            // var PurchaseDataWithoutDuplicate = [];
            // await AllPurchases.forEach((EachOldPurchase)=>{
            //     LedgerData.TableData.forEach((EachPurchaseData)=>{

            //         if(EachOldPurchase.VchNo !== EachPurchaseData.VchNo){
            //             PurchaseDataWithoutDuplicate.push(EachPurchaseData);
            //         }
            //     })
            // })

            // await db.get().collection(collection.CUSTOMER_PURCHASE_COLLECTION).insertMany(LedgerData.TableData).then(()=>{
            //     resolve();
            // })


            // Update each purchase data with the provided branch
            LedgerData.TableData.forEach((EachPurchaseData) => {
                EachPurchaseData.Branch = Branch;
                EachPurchaseData.UploadedPerson = UserName;
                EachPurchaseData.CustomerName = CustomerName;
                EachPurchaseData.InsertedTime = Date.now();
            });

            LedgerData.Branch = Branch;

            // Insert LedgerData into the Ledger Uploaded Data collection
            await db.get().collection(collection.LEDGER_UPLOADED_DATA).insertOne(LedgerData);

            // Fetch all purchases for the given branch
            const AllPurchases = await db.get().collection(collection.CUSTOMER_PURCHASE_COLLECTION).find({ "Branch": Branch }).toArray();

            // Identify and filter out duplicate purchase data
            const PurchaseDataWithoutDuplicate = LedgerData.TableData.filter((newPurchaseData) => {
                return !AllPurchases.some((oldPurchase) => oldPurchase.VchNo === newPurchaseData.VchNo);
            });

            const PurchaseDuplicates = LedgerData.TableData.filter((newPurchaseData) => {
                return AllPurchases.some((oldPurchase) => oldPurchase.VchNo === newPurchaseData.VchNo);
            });

            console.log("Purchase Duplicates found: ", PurchaseDuplicates.length);
            console.log("PurchaseData Without Duplicate: ", PurchaseDataWithoutDuplicate.length);


            // Insert non-duplicate purchase data into the Customer Purchase collection
            if (PurchaseDataWithoutDuplicate.length > 0) {
                await db.get().collection(collection.CUSTOMER_PURCHASE_COLLECTION).insertMany(PurchaseDataWithoutDuplicate);
            }
            resolve();
        })
    },
    AddProductGroup: (data) => {
        return new Promise(async (resolve, reject) => {
            var SameGroup = await db.get().collection(collection.PRODUCT_GROUP_COLLECTION).findOne({ GroupName: data.GroupName });
            if (!SameGroup) {
                await db.get().collection(collection.PRODUCT_GROUP_COLLECTION).insertOne(data).then(() => {
                    resolve();
                })
            } else {
                // already same group name exist
                resolve({ Error: "Same group name exist!" });
            }
        })
    },
    getAllProductGroups: () => {
        return new Promise(async (resolve, reject) => {
            var AllGroup = await db.get().collection(collection.PRODUCT_GROUP_COLLECTION).find().toArray();
            resolve(AllGroup);
        })
    },
    deleteProductGroup: (GroupName) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_GROUP_COLLECTION).deleteOne({ GroupName: GroupName }).then(() => {
                resolve();
            })
        })
    },










    // cost Update
    getBinderById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Additive = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Id: parseInt(id) })
            resolve(Additive);
        })
    },
    PutCostByID: (data) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BINDER_COLLECTION).updateOne({ Binder_Id: parseInt(data.Item) }, {
                $set: {
                    cost: data.Cost,
                    PriceUnit: data.PriceUnit
                }
            }).then(() => {
                resolve();
            })
        })
    }
}  