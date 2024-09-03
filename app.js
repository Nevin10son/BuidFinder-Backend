const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('./models/admin');
const professionalModel = require('./models/professionals');

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://Nevin:nevintensonk@cluster0.0rfrr.mongodb.net/buildfinder?retryWrites=true&w=majority&appName=Cluster0")

app.post("/builderSignin", async(req, res)=> {
    let buildercred = req.body
    professionalModel.find({emailid:buildercred.emailid}).then(
        (datas) => {
            if (datas.length == 0) {
                res.json({"Error":"Invalid Username"})
            }
            else {
                let pwdValidator = bcrypt.compareSync(buildercred.password,datas[0].password)
                if (pwdValidator) {
                    jwt.sign({emailid:buildercred.emailid},"builderstoken",{expiresIn:"1d"},(error, token) => {
                        if (error){
                            res.json({"Status":"Error","Error":error})
                        }
                        else {
                            console.log(buildercred)
                            res.json({"Status":"Success","token":token,"userid":datas[0]._id})
                        }
                    })
                }
                else {
                    res.json({"Error":"Incorrect Password"})
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