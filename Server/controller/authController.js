import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModels.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req,res)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.json({success:false,message:"Missing Details"});
    }

    try {

        const existingUser = await userModel.findOne({email});
        if(existingUser)
        {
            return res.json({success:false,message:"User already exist"});
        }
        const hashPassword = await bcrypt.hash(password,10);
        const user = new userModel({name,email,password:hashPassword});
        await user.save();

        const token = jwt.sign({id : user._id}, process.env.SECRET_KEY, {expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? 'none':'strict',
            maxAge: 7*24*60*60*1000,
        });

        const mailOptions = {
            from : process.env.SENDER_MAIL,
            to : email,
            subject: "Welcome to XPand ",
            text: `Your account is verified with email : ${email}`
        }

        await transporter.sendMail(mailOptions);
        
        return res.json({success:true,message:"Sign Up successful"});

    } catch (error) {
        res.json({success:false,meaasge:error.meaasge});
    }
}

export const Login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password)
    {
        return res.json({success:false, message:"Missing Details"});
    }
    
    try {
        
        const user = await userModel.findOne({email});
        if(!user)
        {
            return res.json({success:false, message:"User Not Found"});
        }
        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if(!isCorrectPassword)
        {
            return res.json({success:false,message:"Invalid credentials"});
        }

        const token = jwt.sign({id : user._id}, process.env.SECRET_KEY, {expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? 'none':'strict',
            maxAge: 7*24*60*60*1000,
        });
        
        return res.json({success:true, message:"Login Successfull"});

    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}

export const logout = async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? 'none':'strict',
        });
        return res.json({success:false,message:"Logout Successful!"});
    } catch (error) {
        return res.json({success:false, message:error.meaasge});
    }
}