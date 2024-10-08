const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('./models/admin');
const professionalModel = require('./models/professionals'); 

const multer = require('multer');
const profileModel = require('./models/profie');
const clientModel = require('./models/client');

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://Nevin:nevintensonk@cluster0.0rfrr.mongodb.net/buildfinder?retryWrites=true&w=majority&appName=Cluster0")

const storage = multer.memoryStorage();
const upload = multer({storage:storage})

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
    jwt.verify(token,"builderstoken",async(error, decoded)=> {
        if (decoded && decoded.emailid){
           let professional = await professionalModel.findOne({emailid:decoded.emailid})
           let profileExist = await profileModel.findOne({userid:professional._id}) 
            if (profileExist){
                res.json({"Status":"Profile already created"})
            }
            else if (!profileExist) {
               
           
        
                const profiles = new profileModel(
                    {   
                        userid:professional._id,
                        firmname:req.body.firmname,
                        field:req.body.field,
                        experience:req.body.experience,
                        location:req.body.location,
                        language:req.body.language,
                        aboutme:req.body.aboutme,
                        profilepic:{
                            data:req.file.buffer,
                            contentType:req.file.mimetype

                    }
                }
                )
                await profiles.save()
                res.json({"Status":"Profile Update"})
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
                            let profileCreated = await profileModel.findOne({userid:datas[0]._id})
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