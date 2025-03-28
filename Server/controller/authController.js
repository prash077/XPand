import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModels.js';

export const register = async (req,res)=>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.json({status:failed,message:"Missing Details"});
    }

    try {

        const existingUser = await userModel.findOne({email});
        if(existingUser)
        {
            return res.json({status:failed,message:"User already exist"});
        }
        const hashPassword = await bcrypt.hash(password,10);
        const user = new userModel({name,email,hashPassword});
        await user.save();

        const token = jwt.sign({id : user._id}, process.env.SECRET_KEY, {expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? 'none':'strict',
            maxAge: 7*24*60*60*1000,
        });
        
    } catch (error) {
        res.json({status:failed,meaasge:error.meaasge});
    }
}