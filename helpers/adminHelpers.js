var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');
const { request, response } = require('express');


module.exports = {
    AddCategory: (data) => {
        return new Promise(async (resolve, reject) => {

            // Daclare State of the process
            var State = {};
            console.log(collection.CATEGORY_COLLECTION);
            // first check whether the category is already entered in the database
            var SameCatagory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ "Category": data.Category })
            console.log(SameCatagory);
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
                console.log(LastAddedCategory);

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
            console.log("Going to delete category with id", id);
            var State = { Status: false, error: "" }
            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ "_id": new ObjectId(id) }).then((response) => {
                console.log(response);
                if (response.deletedCount) {
                    State.Status = true;
                } else {
                    State.Status = false;
                }
                resolve(State);
            })
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
                console.log(InsertedSubCategories);
                if (InsertedSubCategories.length > 0) {
                    var latestInsertSubCategory = InsertedSubCategories[0];
                    data.SubCategory_Id = latestInsertSubCategory.SubCategory_Id + 1;
                } else {
                    data.SubCategory_Id = 1000;
                }

                data.InsertedTime = Date.now();
                console.log("Going to add Sub Category", data);
                var State = { Status: false, error: "" }
                await db.get().collection(collection.SUB_CATEGORY_COLLECTION).insertOne(data).then((response) => {
                    console.log(response);
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
                console.log(response);
            })

            await db.get().collection(collection.SUB_CATEGORY_COLLECTION).updateOne({ "SubCategory": data.SubCategory }, { $set: data }).then((response) => {
                console.log(response);
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
    getSubCategoryById: (id) => {
        return new Promise(async (resolve, reject) => {
            var Subcategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({ "SubCategory_Id": parseInt(id) });
            // console.log(Subcategory);
            resolve(Subcategory);
        })
    },
    addProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            // console.log(data)
            var SameProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": data.Product_Name });
            // console.log(SameProduct);
            var State = {
                Status: false,
                error: false
            }
            if (!SameProduct) {

                data.InsertedTime = Date.now();

                var latestProductAdded = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ "InsertedTime": -1 }).toArray()
                // console.log(latestProductAdded);

                if (latestProductAdded.length > 0) {
                    latestProductAdded = latestProductAdded[0];
                    data.Product_Id = parseInt(latestProductAdded.Product_Id) + 1;
                } else {
                    data.Product_Id = 10000;
                }

                await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(data).then((response) => {
                    if (response.insertedId) {
                        State.Status = true;
                    } else {
                        State.Status = false;
                        State.error = "Product is not Added, Try Again."
                    }
                })
            } else {
                State.error = "Product Already Exists."
            }
            resolve(State);
        })
    },
    GetProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            var Product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ SubCategory: id }).toArray();
            resolve(Product);
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
            console.log(id);
            var product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(id) });
            resolve(product);
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
            var SameProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Product_Id: parseInt(data.Product_Id) });
            // console.log(SameProduct);
            if (SameProduct) {

                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    { _id: SameProduct._id },
                    {
                        $set: {
                            Category: data.Category,
                            SubCategory: data.SubCategory,
                            Product_Name: data.Product_Name,
                            Product_Density: data.Product_Density,
                            Price_Liter: data.Price_Liter,
                            Price_Kilogram: data.Price_Kilogram,
                            VOC: data.VOC,
                            SolidContent: data.SolidContent,
                            Stock: data.Stock
                        }
                    }
                ).then((response) => {
                    // console.log(response);
                    if (response.acknowledged) {
                        State.Status = true;
                    }
                    resolve(State)
                });

            }

        })
    },
    DeleteProductById: (id) => {
        return new Promise(async (resolve, reject) => {
            var State = {
                Status: false,
                error: ""
            }

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
    AddBinders: (data) => {
        return new Promise(async (resolve, reject) => {
            // console.log(data);
            var State = {
                Status: false,
                error: ""
            }
            var SameBinder = await db.get().collection(collection.BINDER_COLLECTION).findOne({ Binder_Name: data.Binder_Name });
            if (!SameBinder) {
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
            } else {
                State.error = "This Binder Already Added!"
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
        console.log(id);
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
                console.log(response);
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
                console.log(response);
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
            console.log("IsAdmin", IsAdmin);
            var Admin = {
                name: "Admin",
                password: Newpassword
            };
            console.log("New Data: ", Admin);

            if (IsAdmin) {
                // check password mathced and update
                // Already changed the password One Time
                if (IsAdmin.password === CurrentPassword) {
                    //Old Passwprd matches
                    await db.get().collection(collection.ADMIN_COLLECTION).updateOne({ "password": CurrentPassword }, { $set: Admin }).then((response) => {
                        console.log("password Updated in database")
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
                        console.log(response.insertedId);
                        console.log("Password Added to database!");
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
    AdminLogin: (data,AdminUser) => {
        return new Promise(async (resolve, reject) => {
            var IsAdmin = await db.get().collection(collection.ADMIN_COLLECTION).findOne();
            console.log("IsAdmin", IsAdmin);

            if(IsAdmin){
                // admin Data already in database
                if(IsAdmin.name == data.userName && IsAdmin.password == data.password){
                    // Good Login Input
                    resolve({Status:true});
                }else{
                    // wrong login input
                    resolve({Status :false, err: "Wrong login credentials"})
                }
            }else{
                // admin data not on database
                if(AdminUser.userName == data.userName && AdminUser.password == data.password){
                    // Good Login Input
                    resolve({Status:true});
                }else{
                    // wrong login input
                    resolve({Status :false, err: "Wrong login credentials"})
                }
            }
        })
    }
}  