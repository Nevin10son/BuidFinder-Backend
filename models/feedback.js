const mongoose = require('mongoose')
const schema = mongoose.Schema(
    {
        clientid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'clients'
        },
        professionlId:{
            type:String,
            required:true
        },
        feedback:{
            type:String,
            required:true
        }
    }
)
const feedbackModel = mongoose.model("feedbacks",schema)
module.exports = feedbackModel