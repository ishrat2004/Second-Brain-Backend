import express from 'express';
const app=express(); 
import {ContentModel, LinkModel, UserModel} from "./db"; 
import jwt from 'jsonwebtoken'; 
import { authMiddleware } from './middleware';
import { random } from './utils';
import cors from "cors"; 
import e from 'express';
app.use(express.json()); 
app.use(cors()); 
const JWT_SECRET="Ishratkhan" 
app.post("/api/v1/signup",async (req,res)=>{ 
    // add bcryopt and zod validation
    ///checking for user existing
    const { username, password } = req.body;  
    try{ 
    await UserModel.create({
        username: username,
        password: password
     }) 
     res.json({ 
        msg: "User created successfully",
     })
    }catch(e){ 
        console.log("user already exists"); 
        res.status(500).json({ 
            msg: "User already exists or error occurred"
        })
    }

})
app.post("/api/v1/signin",async (req,res)=>{ 
     const { username, password } = req.body;  
     let user=await UserModel.findOne({username,password});

     if(user){ 
            const token=jwt.sign({id:user._id},JWT_SECRET);  
            res.json({ 
                token: token,
                username:username
            })
     } 
     else{ 
        res.status(401).json({ 
            msg: "Invalid username or password" 
        })
     }

})
app.post("/api/v1/content",authMiddleware,async (req,res)=>{ 
     // const { title, link, tags,type } = req.body; 
     const title=req.body.title;
      const link=req.body.link;
      const type=req.body.type;
      await ContentModel.create({ 
        title,
        link,
        type,
        //@ts-ignore 
        /// u would have ovverriden the types of request object which is provided by express
        userId: req.userId, // assuming req.userId is set by authMiddleware
        tags:[]
      } )

      res.json({ 
        msg: "Content created successfully",
      })
})
app.get("/api/v1/content",authMiddleware,async (req,res)=>{ 
    const content=await ContentModel.find({
        /// @ts-ignore
        userId:req.userId}).populate("userId","username");  /// gives all the content created by the user incl password,second arg is selector
        res.json({ 
            content: content
        })
}) 

app.delete("/api/v1/content/:id",authMiddleware,async (req,res)=>{ 
    console.log("in delete");
    const contentId=req.params.id; 
    console.log("contentId",contentId);
    await ContentModel.deleteMany({
        _id:contentId,
        //@ts-ignore
        userId:req.userId
    }) 
    res.json({ 
        msg:"deleted successfully"
    })
    
})
app.post("/api/v1/brain/share",authMiddleware,async (req,res)=>{ 
   const share=req.body.share; 
    if(share){ 
        const existingLink=await LinkModel.findOne({ 
            //@ts-ignore
            userId:req.userId
        }); 
        if(existingLink){ 
            res.json({ 
                link: `http://localhost:3000/api/v1/brain/${existingLink.hash}`,
            })
            return; 
        }
        const hashed_one=random(10); 
        await LinkModel.create({ 
            ///@ts-ignore
            userId:req.userId,
            hash:hashed_one
        }) 
        res.json({ 
            msg: "Share status updated successfully",
            link:`http://localhost:3000/api/v1/brain/${hashed_one}` // this is the link to share
        })
    }
    else{ 
       await  LinkModel.deleteOne({ 
            //@ts-ignore
            userId:req.userId
        })
        res.json({ 
            msg: "Share status removed successfully" 
        })
    } 
    res.json({ 
        msg:"Updated share status successfully"
    })
} ) 
app.get("/api/v1/brain/:shareLink",async (req,res)=>{ 
    const hash=req.params.shareLink; 
    const link=await LinkModel.findOne({ 
        hash
    }) 
    if(!link){ 
        res.json({ 
            msg: "No shared content found for this link"
        }) 
        return; /// if u dont ts will complain abt link
    } 
    /// we got link from the link model, now we can get the content of that user 
    const content=await ContentModel.findOne({ 
        userId:link.userId 
    }) 
    /// we need to get user also 
    const user=await UserModel.findOne({ 
        _id:link.userId
    })
   // check whether user exists or not
    if(!user){ 
        res.json({ 
            msg: "User not found"
        }) 
        return; 
    } 
    res.json({ 
        username:user.username,
        content:content
    })
   ///sequentially we are getting the content 

})
app.listen(3000); 