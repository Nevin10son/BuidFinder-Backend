const mongoose = require('mongoose')
const schema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        field:{
            type:String,
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
        mobileno:{
            type:Number,
            required:true
        },
        gender:{
            type:String,
            required:true
        },
        location:{
            type:String,
            required:true
        },
        experience:{
            type:String,
            required:true
        }

}
)
const professionalModel = mongoose.model("Professional",schema)
module.exports = professionalModel