const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('./models/admin');
const professionalModel = require('./models/professionals'); 
const path = require('path')


const multer = require('multer');
const profileModel = require('./models/profie');
const clientModel = require('./models/client');
const questionModel = require('./models/question');

const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb+srv://Nevin:nevintensonk@cluster0.0rfrr.mongodb.net/buildfinder?retryWrites=true&w=majority&appName=Cluster0")

const storage =  multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()
        cb(null, uniqueSuffix + file.originalname)
    }
})

const upload = multer({storage:storage})

app.post("/seeAnswers", async(req, res) => {
    let input = req.body
    let token = req.headers.token
    jwt.verify(token,"clienttoken", async(error, decoded) => {
        if (decoded && decoded.emailid) {
            const questions = await questionModel.find(input).populate(
                'answers.professionalId', 'name'
            ).exec()
            res.json({"Status":"Success", questions})
        }else if (error) {
            res.json({"Status":error.message})
        }
        else {
            res.json({"Status":"Invalid Authentication"})
        }
    }).catch(
        (err) => {
            res.json({"Error":err.message})
        }
    )
})

app.post("/setAnswer", async(req, res) => {
    let answer = req.body
    console.log(answer)
    let token = req.headers.token
    jwt.verify(token, "builderstoken", async(error, decoded) => {
        if (decoded && decoded.emailid) {
            const newAnswer =  {
                professionalId:req.body.professionalId,
                answer:req.body.answer
            }
            await questionModel.findByIdAndUpdate(
                req.body.questionId,
                {$push: {
                    answers: newAnswer
                }}
            )
            res.json({"Status":"Answer added Successfully"})
            
        }else{
            res.json({"Error":error.message})
        }
    }).catch(
        (error) => {
            res.json({"Status":error.message})
        }
    )
})

app.post("/getQuestions", async(req, res) => {
    let field = req.body
    console.log(field)
    let token = req.headers.token
    jwt.verify(token,"builderstoken", async(error, decoded) => {
        if (decoded && decoded.emailid) {
            questionModel.find(field).then(
                (questions) => {
                    if(questions.length > 0) {
                        console.log(questions)
                        res.json(questions)
                    }else{
                        res.json({"Status":"No Questions"})
                    }
                }
            )
        } else {
            res.json({"Error":error.message})
        }
    })
})

app.post("/askQuestion", async(req, res)=> {
    let question = req.body
    console.log(question)
    let token = req.headers.token
    jwt.verify(token, "clienttoken",async(error, decoded) => {
        if (decoded && decoded.emailid) {
            let questions = new questionModel(question)
            await questions.save()
            
            res.json({"Status":"Success"})
        } else if (error){
            
                res.json({"Error":"Error"})
                
            }
        }
)})



app.post("/searchDesigns", (req, res) => {
    let clientInput = req.body
    console.log(clientInput)
    let token = req.headers.token
    jwt.verify(token, "clienttoken",(error,decoded) => {
        if (decoded && decoded.emailid) {
            console.log(decoded.emailid)
            profileModel.find(clientInput).then(
                (items) => {
                    if (items.length == 0) {
                        res.json({"Status":"No result"})
                    } else {
                        res.json(items)
                    }   
                }
            ).catch(
                (error) =>{
                    res.json({"Error":error.message})
                }
            )
        } else {
            res.json({"Status":"Invalid Authentication"+error.message})
        }
    })

})

app.post("/builderDashboard", (req, res) => {
    let input = req.body
    let token = req.headers.token
    jwt.verify(token, "builderstoken", (error,decoded) => {
        if (decoded && decoded.emailid) {
            profileModel.find(input).then(
                (items) => {
                    res.json(items)
                }
            ).catch(
                (error) => {
                    res.json({"Error":error.message})
                }
            )
        }
        
    } )
})

app.post("/clientsignin", async(req, res) => {
    let client = req.body
    clientModel.find({emailid:client.emailid}).then(
        (detail) => {
            if (detail.length == 0) {
                res.json({"Status":"invalid Emailid"})
                
            } else {
                let passcheck = bcrypt.compareSync(client.password,detail[0].password)
                if (passcheck) {
                    jwt.sign({emailid:client.emailid},"clienttoken",{expiresIn:"1d"},(error, token) => {
                        if (error) {
                            res.json({"Status":"Error","Error":error})
                        }
                        else {
                            res.json({"Status":"Success","token":token,"userid":detail[0]._id})
                        }
                    })
                    
                } else {
                    res.json({"Status":"Incorrect Password"})
                }
            }
        }
    )
})

app.post("/clientsignup", async(req, res) => {
    let clientdetails = req.body
    let hashedpswd = bcrypt.hashSync(clientdetails.password,10)
    clientdetails.password = hashedpswd
    clientModel.find({emailid:clientdetails.emailid}).then(
        (items) => {
            if (items.length == 0){
                let clients = new clientModel(clientdetails)
                clients.save()
                res.json({"Status":"Success"})
            }
            else{
                res.json({"Status":"Email id already existing"})
            }
        }
    )
})

app.post("/profile",upload.single('profilepic'), async(req, res) => {
    
    
    
    
    let token = req.headers.token
    console.log(token)
    jwt.verify(token,"builderstoken",async(error, decoded)=> {
        if (decoded && decoded.emailid){
            
            
           
           let profileExist = await profileModel.find({userId:req.body.userId}) 
           console.log(profileExist)
            if (profileExist.length > 0){
                res.json({"Status":"Profile already created"})
            }
            else if (profileExist == 0) {
                
               
           
        
                const profiles = new profileModel(
                    {   
                        userId:req.body.userId,
                        firmname:req.body.firmname,
                        field:req.body.field,
                        experience:req.body.experience,
                        location:req.body.location,
                        language:req.body.language,
                        aboutme:req.body.aboutme,
                        profilepic:req.file.filename
                }
                )
                console.log(profiles)
                
                await profiles.save()
                res.json({"Status":"Profile Update","field":profiles.field})

            }
        
        
    }
    else {
        res.json({"Status":"Invalid Authentication"})
    }})
    
    
})


app.post("/builderSignin", async(req, res)=> {
    let buildercred = req.body
    professionalModel.find({emailid:buildercred.emailid}).then(
        (datas) => {
            if (datas.length == 0) {
                res.json({"Status":"Invalid Username"})
            }
            else {
                let pwdValidator = bcrypt.compareSync(buildercred.password,datas[0].password)
                if (pwdValidator) {
                    jwt.sign({emailid:buildercred.emailid},"builderstoken",{expiresIn:"1d"},async(error, token) => {
                        if (error){
                            res.json({"Status":"Error","Error":error})
                        }
                        else {
                            let profileCreated = await profileModel.findOne({userId:datas[0]._id})
                            res.json({"Status":"Success","token":token,"userid":datas[0]._id,"profileCreated":!!profileCreated})
                        }
                    })
                }
                else {
                    res.json({"Status":"Incorrect Password"})
                }
            }
        }
    )
})


app.post("/buildersSignup", async(req, res)=> {
    let details = req.body
    let hashedpwd = bcrypt.hashSync(details.password,10)
    details.password = hashedpwd
    professionalModel.find({emailid:details.emailid}).then(
        (items) => {
            if (items.length == 0) {
                let professional = new professionalModel(details)
                professional.save()
                res.json({"Status":"Success"})
            }
            else {
                res.json({"Error":"email id already exist"})
            }
        }
    )
})

app.post("/adminSignIn", async(req, res)=>{
    let admincred = req.body
    adminModel.find({}).then(
        (item) => {
            if (admincred.username != item[0].username) {
                res.json({"Status":"Invalid Username"})
            }
            else{
            let passwordValidator = bcrypt.compareSync(admincred.password,item[0].password)
            if (passwordValidator) {
                jwt.sign({username:admincred.username},"Admintoken",{expiresIn:"1d"},(error, token) => {
                    if (error) {
                        res.json({"Status":"Error", "Error":error})
                    }
                    else {
                        console.log(admincred)
                        res.json({"Status":"Success","token":token,"UserId":item[0]._id})
                    }

                    
                })}
                else{
                    res.json({"Status":"Incorrect Password"})
                }
            }
        }
                
                
            
            
        
    )
})



app.post("/adminSignUp", async(req, res) =>{
    let admindata = req.body
    let hashedPwd = bcrypt.hashSync(admindata.password,10)
    admindata.password = hashedPwd
    adminModel.find({}).then(
        (item) =>{
            if(item.length == 0) {
                let admin = new adminModel(admindata)
                admin.save()
                res.json({"Status":"Success"})
            }
            else {
                res.json({"Error":"Admin already registered"})
            }
            
        }
    )
})





app.listen(8000,() =>{
    console.log("Server Started")
})