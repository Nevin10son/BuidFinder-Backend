const mongoose = require('mongoose')
const schema = mongoose.Schema(
    {
        userid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Professional"
        },
        firmname:{
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
        profilepic:{
            data:Buffer,
            contentType:String
        }
    }
)

const profileModel = mongoose.model("profiles",schema)
module.exports = profileModel