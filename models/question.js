const mongoose = require('mongoose')
const answerSchema = mongoose.Schema(
    {   
        professionalId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Professional',
            required:true
        },
        answer:{
            type:String,
            required:true
        },
        answerAt: {
            type:Date,
            default:Date.now    
        }
    }
)

const questionSchema = mongoose.Schema(
    {
        ClientId: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'clients',
            required:true
        },
        field: {
            type:String,
            required:true
        },
        question: {
            type:String,
            required:true
        },
        createdAt: {
            type:Date,
            default:Date.now,
            
        },
        answers: [answerSchema]

    }
)

const questionModel = mongoose.model('Questions',questionSchema)
module.exports = questionModel