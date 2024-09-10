import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { configDotenv } from "dotenv";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getUsers = asyncHandler( async(req, res) => {
    //Set up validationResult

    //Simple get all users
    try {
        const allUsers = await prisma.user.findMany(
            {
                select: {
                    name: true,
                    id: true,
                    email: true,
                }
            }
        )
        res.status(200).json({allUsers})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: "Could not retrieve users"})
    }

})

const getUser = asyncHandler( async(req, res) => {
    // const client = req.user //Not needed here as passport handles this at the actual route
    const id = parseInt(req.params.id)

    try {
        const user = await prisma.user.findUnique( 
            {
                where: {
                    id: id
                },
                select: {
                    id: true,
                    name: true,

                }
            }
        )
        res.status(200).json({user})
    } 
    
    catch (error) {
        console.error(error)
        res.status(500).json({error: "Couldn't get user"})
    }


})

const updateUserPassword = asyncHandler( async(req, res) => { //Moving this to the auth route eventually.

    //Come back to this a bit later

    // const client = req.user 
    const id = parseInt(req.params.id)
    const {email, currentPassword, newPassword} = req.body

    //If I think about the user flow for this...
    //1. user clicks on a link to request password reset
    //2. the user usually gets emailed a link or something 



})

const deleteUser = asyncHandler( async(req, res) => {
    
})

export default {
    getUsers,
    getUser,
    updateUserPassword,
    deleteUser
}