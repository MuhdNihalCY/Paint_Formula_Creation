var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');

module.exports={
    getAllCollections:()=>{
        return new Promise(async(resovle,reject)=>{
            var AllCategory = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray(); 
            resovle(AllCategory);
        })
    },
    GetProductBySubId:(SubId)=>{
        return new Promise(async(resolve,reject)=>{
            SubId = SubId+'';
            var Products = await db.get().collection(collection.PRODUCT_COLLECTION).find({SubCategory:SubId}).toArray();
            resolve(Products)
        })
    },
    GetSubcategotyById:(SubId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(SubId)
            var SubCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({SubCategory_Id:parseInt(SubId)})
            resolve(SubCategory)
        })
    },
    getBinderById:(id)=>{
        return new Promise(async(resolve,reject)=>{
            var Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({Binder_Id:parseInt(id)});
            resolve(Binder);
        })
    }
}