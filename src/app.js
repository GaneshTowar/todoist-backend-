const express = require("express"); // require express application
require("../src/db/conn")
const cors = require('cors');

const MensRanking = require("../src/models/mens")
const listdata = require("../src/models/listdata")
const app = express();
const port = process.env.PORT || 8000;


const Jwt = require('jsonwebtoken');
const jwtKey ='e-comm'

var day = new Date();
var dd =  String(day.getDate());

var mm =  String(day.getMonth()+1); 
var yyyy =  String(day.getFullYear());
if(dd<10) 
{
    dd='0'+dd;
    
} 

if(mm<10) 
{
    mm='0'+mm;
    
} 


app.use(cors())
app.use(express.json());

app.post("/register", async(req, res) =>{
    try {
        console.log(req.body)
        //const [name ,password] = req.body.body
        const user = await MensRanking.findOne({name:req.body.name});
        //console.log(user)
        if(user){
            console.log("user already exist")
            res.status(400).send("user already exist")
        }
        else{
            const addingMensRecords = new MensRanking({
                name: req.body.name,
                password: req.body.password
            })
            const insertMens = await addingMensRecords.save()
            Jwt.sign({insertMens}, jwtKey,{expiresIn:"24h"}, (err,token)=>{
                if(err){
                    console.log("jwt problem"+ err)
                    res.status(400).send({result:"Something went worng in JWT reg"})
                }
                else{
                    console.log("ok")
                    res.status(201).send({auth:token,username:insertMens.name})
                }
               
            })
        }
   
    } catch (e) {
        console.log("catch error 400 "+ e)
        res.status(400).send(e);
    }
})

app.post("/search",verifyToken, async(req,res) =>{
    try{
        const searchlist = await listdata.find({
            name:req.body.name });
            //console.log(searchlist)
            //title: {$regex:".*"+req.body.searchName+".*" } 
            const result = searchlist.find({title: {$regex:".*"+req.body.searchName+".*" }})
            console.log('searxhiing')
            console.log(result)
            res.status(200).send(result)
       


    }catch{

    }
})


app.post("/addlist",verifyToken, async(req, res) =>{
    try {
        //console.log(req.body)
        const addingListDataRecords = new listdata(req.body)
        //console.log(req.body)
        const insertlist = await addingListDataRecords.save()
        console.log("adding data")
        //console.log(insertlist)
    } catch (e) {
        res.status(400).send(e);
    }
})



// app.get("/mens", async(req, res) =>{
//     try {
//         const getMens = await MensRanking.find({});
//         res.status(201).send(getMens)
//     } catch (e) {
//         res.status(400).send(e);
//     }
// })


app.post("/login", async(req, res) =>{
    try {
        console.log(req.body)
        const getMens = await MensRanking.findOne({name:req.body.name});
        console.log(getMens.password === req.body.password)
        if(getMens.length === 0 || getMens.password != req.body.password){
            console.log("user not found")
            throw "User doesn't exist"
        }else{

            Jwt.sign({getMens}, jwtKey,{expiresIn:"24h"}, (err,token)=>{
                if(err){
                    console.log("jwt wrong")
                    res.send({result:"Something went worng in JWT log"})
                }else{
                    console.log("201 sent")
                    res.status(201).send({getMens,auth:token})
                }
                
            })
            
        }
       
    } catch (e) {
        console.log("400 user not found " + e)
        res.status(400).send(e);
    }
})

app.patch("/listData/:id",verifyToken, async(req, res) =>{
    try {
        const _id = req.params.id
        const getList = await listdata.findByIdAndUpdate(_id,req.body,{
            new:true
        });
        console.log(getList)
        res.send(getList)
    } catch (e) {
        res.status(400).send(e);
    }
})


app.delete("/listdata/:id",verifyToken, async(req, res) =>{
    try {
       
        const getList = await listdata.findByIdAndDelete(req.params.id);
        res.send(getList)
    } catch (e) {
        res.status(400).send(e);
    }
})

app.get("/listData/:username",verifyToken, async(req, res) =>{      //get list data by username 
    try {
        const data = req.params.username
        const list = await listdata.find({username:data});
        res.status(201).send(list)
        
    } catch (e) {
        res.status(400).send(e);
    }
})

app.get("/todays/:username",verifyToken, async(req, res) =>{      //get todays data by username 
    try {
        const data = req.params.username
        const list = await listdata.find({username:data});
        const today = await list.filter((todo)=>{
            return todo.date === `${yyyy}-${mm}-${dd}`
        })
        console.log(today)
        res.status(201).send(today)
        
    } catch (e) {
        res.status(400).send(e);
    }
})

app.get("/upcoming/:username",verifyToken, async(req, res) =>{      //get upcoming data by username 
    try {
        const data = req.params.username
        const list = await listdata.find({username:data});
        const today = await list.filter((todo)=>{
            const myArray = todo.date.split("-");
            let year =  myArray[0];
            let mon = myArray[1];
            let d = myArray[2];
            if(yyyy + mm+ dd < year + mon + d)
            {
                return true
            }
           // return todo.date === `${yyyy}-${mm}-${dd}`
        })
        console.log(today)
        res.status(201).send(today)
        
    } catch (e) {
        res.status(400).send(e);
    }
})

function verifyToken(req,res,next){
    let token = req.headers['authorization']
    //console.log("verification " + token + " " + req.headers + " / ")
    if(token){
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey,(err, valid)=>{
            if(err){
                res.status(401).send(err)
            }else{
                next()
            }
        })
    }
    else{
        res.status(403).send({result:"please add token with header"})
    }
}


app.listen(port, () => {
    console.log(`connection is live at port no, ${port}`);
})