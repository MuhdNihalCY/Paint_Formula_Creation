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
            console.log(Category);
            resolve(Category);
        })
    },
    DeleteCategory:(id)=>{
        return new Promise(async(resolve,reject)=>{
            console.log("Going to delete category with id", id);
            var State = { Status: false, error: "" }
            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ "_id": new ObjectId(id) }).then((response) => {
                console.log(response);
                if(response.deletedCount){
                    State.Status = true;
                } else {
                    State.Status = false;
                }
                resolve(State);
            })
        })
    }
} 