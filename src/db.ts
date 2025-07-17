import mongoose, { model } from 'mongoose' 
import {Model,Schema} from 'mongoose'; 
mongoose.connect("mongodb+srv://ishratalikhan004:Ishratkhan22@cluster0.fzscbb3.mongodb.net/second-brain")

const UserSchema=new Schema({ 
    username:{type:String,required:true,unique:true}, 
    password:{type:String,required:true}, 
}) 


const ContentSchema=new Schema({ 
    title:String,
    link:String, 
    tags:[{type:mongoose.Types.ObjectId,ref:'Tag' }], 
    type:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
})

const LinkSchema=new Schema({ 
     hash:String, 
     userId:{type:mongoose.Types.ObjectId,ref:'User',required:true,unique:true }
})
// const UserModel=new Model(UserSchema,"User");   
export const UserModel=model("User",UserSchema); /// gives the types 
export const ContentModel=model("Content",ContentSchema); /// gives the types 
export const LinkModel=model("Link",LinkSchema);