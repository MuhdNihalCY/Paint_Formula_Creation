var db = require('../config/connection');
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');

module.exports = {
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
    FindProductByName:(ProductName)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({"Product_Name":ProductName})
            resolve(product)
        })
    },
    FindAdditiveDensityById:(Add_Id)=>{
        return new Promise(async(resolve,reject)=>{
            let additive=await db.get().collection(collection.ADDITIVE_COLLECTION).findOne({"Additive_Id":parseFloat(Add_Id)});
            resolve(additive);
        })
    },
    FindBinderByName:(BinderName)=>{
        return new Promise(async(resovle,reject)=>{
            let Binder = await db.get().collection(collection.BINDER_COLLECTION).findOne({"Binder_Name":BinderName});
            resovle(Binder);
        })
    }
}