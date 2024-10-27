const mongoose = require('mongoose')
const schema = mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Professional",
            required:true
        },
        firmname:{
            type:String,
            required:true
        },
        mobileno:{
            type:String,
            required:true
        },
        field:{
            type:String,
            required:true
        },
        experience:{
            type:String,
            required:true
        },
        location:{
            type:String,
            required:true
        },
        language:{
            type:String,
            required:true
        },
        aboutme:{
            type:String,
            required:true
        },
        Status:{
            type:String,
            required:true
        },
        profilepic:{
            type:String,
            required:true
        }
    }
)

const profileModel = mongoose.model("profiles",schema)
module.exports = profileModel