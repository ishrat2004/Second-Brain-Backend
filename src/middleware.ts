import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'; 
const JWT_SECRET="Ishratkhan";

//put jwt secret in a third file 
export const authMiddleware = (req:Request, res:Response, next:NextFunction) => { 
    const token=req.headers.token; 
    const decoded=jwt.verify(token as string, JWT_SECRET as string);
    if(decoded){ 
        //@ts-ignore
        req.userId=decoded.id;
        next(); 
    }
    else{ 
        res.status(401).json({
            msg: "Unauthorized access"
        });
    }
}