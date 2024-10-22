const mongoose = require('mongoose')
const categorySchema = mongoose.Schema({
    
    title:{
        type:String,
        required:true
    },
    images:[
        {
            url: {
                type:String,
                required:true
            }

        }
    ]
})

const projectSchema = mongoose.Schema({

    professionalId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Professional",
        required:true
    },
    projectTitle: {
        type:String,
        required:true
    },
    projectType: {
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    clientname:{
        type:String,
        required:true
    },
    startdt:{
        type:Date,
        required:true
    },
    enddt:{
        type:Date,
        required:true
    },
    workcost:{
        type:String,
        required:true
    },
    constructionType:{
        type:String,
        required:true
    },
    builtUpArea:{
        type:String,
        required:true

    },
    bedrooms:{
        type:Number,
        required:true

    },
    style:{
        type:String,
        required:true
    },
    plotSize:{
        type:String,
        required:true
    },
    scope:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    categories:[categorySchema],
    createdAt:{
        type:Date,
        default:Date.now
    }

})

const projectModel = mongoose.model("projects",projectSchema)
module.exports = projectModel