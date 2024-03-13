
require("dotenv").config()
const multer = require("multer")
const express = require("express")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const app = express()

const upload = multer({dest:"uploads"})

mongoose.connect(process.env.DATABASE_URL)

const File = require("./models/File")


app.use(express.urlencoded({ extended:true }))

//  ---------------------------------------------------

app.set("view engine","ejs")

app.get("/",(req,res)=>{
    res.render("index")
})


app.post("/upload",upload.single("file"), async (req,res)=>{
    // res.send("hi")

    const fileData = {
        path: req.file.path, // 
        originalName:req.file.originalname ,
    }
    if (req.body.password != null && req.body.password !==""){
    // encryption hashing this password 
        fileData.password = await bcrypt.hash(req.body.password, 10) // added step to security 
        
    }

    const file = await File.create(fileData)
    res.render("index",{  fileLink: `${req.headers.origin}/file/${file.id}` })
})




app.route("/file/:id").get(handleDownload).post(handleDownload)





async function handleDownload(req, res) {
    const file = await File.findById(req.params.id);

    if (file.password != null) {
        if (!req.body.password) {
            return res.render("password");
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, file.password);

        if (!isPasswordValid) {
      
            // return 
            return res.render("password", { error: true });
            
            
        }
    }

    file.downloadCount++;
    await file.save();
    console.log(file.download);

    res.download(file.path, file.originalName);
}



app.listen(process.env.PORT)