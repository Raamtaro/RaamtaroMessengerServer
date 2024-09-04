import asyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";

import { validationResult } from "express-validator";
import expressAsyncHandler from "express-async-handler";

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

const loginUser = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ error: info.message });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ user, token });
    })(req, res, next);
  };


const logoutUser = (req, res) => {
    req.logout(function(err) {
        if (err) {
        return res.status(500).json({ error: 'Failed to log out' });
        }

        req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to destroy session' });
        }

        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ message: 'Successfully logged out' });
        });
    });
}

const getProfile = asyncHandler( async (req, res) => {
    res.json(req.user)
})

export default {
    userSignup,
    loginUser,
    logoutUser,
    getProfile
}