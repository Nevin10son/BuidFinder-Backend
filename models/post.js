const mongoose = require('mongoose')
const schema = mongoose.Schema({
    professionalId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Professional',
        required:true,
        
    },
    postedImages:[
        {
            url:{
                type:String,
                required:true
            }
        }
    ],
    description:{
        type:String,
        maxlength:250,
        default:''
    },
    cost:{
        type:Number,
        
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const postModel = mongoose.model("posts",schema)
module.exports = postModel