import asyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";

import { validationResult } from "express-validator";

configDotenv();

const prisma = new PrismaClient()

const userSignup = asyncHandler( async (req, res) => {

    const {email, password, name} = req.body
    //if they haven't submitted the fields, then throw an error
    if (!email || !password || !name) {
        return res.status(400).json({feedback: "Please include email, password and name"})
    }

    //Is there an existing user?
    const existingUser = await prisma.user.findUnique(
        {
            where: {
                email: email
            }
        }
    )
    if (existingUser) {
        return res.status(400).json({feedback: `account with email: ${email} already exists.`})
    }

    
    //If it passes the above checks, then prepare the data.
    const hashedPassword = await bcrypt.hash(password, 11)
    const userData = {
        name, email, password: hashedPassword
    }


    //Create user with new Data
    const newUser = await prisma.user.create(
        {
            data: userData
        }
    )

    res.status(201).json(
        {
            newUser
        }
    )



})


export default {
    userSignup
}