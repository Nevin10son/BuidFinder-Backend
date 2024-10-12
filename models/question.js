const mongoose = require('mongoose')
const schema = mongoose.Schema(
    {   
        field
        question:{
            type:String,
            required:true
        }
    }
)