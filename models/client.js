const mongoose  = require('mongoose')
const schema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobileno:{
        type:Number,
        required:true
    },
    emailid:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    }
})
const clientModel = mongoose.model("clients",schema)
module.exports = clientModel