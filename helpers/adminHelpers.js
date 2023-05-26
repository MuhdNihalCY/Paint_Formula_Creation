var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');
const { request } = require('express');


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
                var State = { Status: false, error: "Sub Category "+ data.SubCategory +" is already in Database" }
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
    GetAllSubCategory: () => {
        return new Promise(async (resolve, reject) => {
            var SubCategories = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().sort({ "InsertedTime": 1 }).toArray()
            resolve(SubCategories);
        })
    },
    addProduct:(data)=>{
        return new Promise(async (resolve, reject) => {
            // console.log(data)
            var SameProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ "Product_Name": data.Product_Name });
            // console.log(SameProduct);
            var State  = {
                Status:false,
                error:false
            }
            if(!SameProduct){

                data.InsertedTime = Date.now();

                var latestProductAdded = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({"InsertedTime": -1}).toArray()
                // console.log(latestProductAdded);

                if(latestProductAdded.length > 0){
                    latestProductAdded = latestProductAdded[0];
                    data.Product_Id = parseInt(latestProductAdded.Product_Id) + 1;
                }else{
                    data.Product_Id = 10000;
                }

                await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(data).then((response)=>{
                    if(response.insertedId){
                        State.Status = true;
                    }else{
                        State.Status = false;
                        State.error = "Product is not Added, Try Again."
                    }
                })
            }else{
                State.error = "Product Already Exists."
            }
            resolve(State);
        })
    },
    GetProduct:(id)=>{
        return new Promise(async (resolve, reject) => {
            var Product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ SubCategory: id }).toArray();
            resolve(Product);
        })
    },
    GetAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            var products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    }
} 