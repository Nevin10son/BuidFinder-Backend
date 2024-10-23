const mongoose =  require('mongoose')
const schema =  mongoose.Schema({
    professionalId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Professional',
        required:true

    },
    productName: {
        type:String,
        required:true
    },
    cost:{
        type:Number,
        required:true
    },
    discount:{
        type:Number

    },
    productDetails:{
        type:String,
        required:true
    },
    specification:{
        type:String
    
    },
    soldBy:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    productImages:[
        {
            url:{
                type:String,
                required:true
            }
        }
    ]
})

const productModel = mongoose.model("products",schema)
module.exports = productModel