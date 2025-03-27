import express from 'express';
import cors from 'cors';
import "dotenv/config";
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}));

connectDB();

app.get(("/"),(req,res)=>{
    res.send("Home Page");
})

app.listen(port,(req,res)=>{
    console.log(`Server is running on port ${port}`);
});
