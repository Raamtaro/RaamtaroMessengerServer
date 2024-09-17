import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getProfiles = asyncHandler( async (req, res) => {
    const allProfiles = await prisma.profile.findMany()
    res.status(200).json(
        {
            allProfiles
        }
    )
})

const getMyProfile = asyncHandler( async (req, res) => {
    const client = req.user
    const myProfile = await prisma.profile.findUnique(
        {
            where: {
                ownerId: client.id
            }
        }
    )
    res.status(200).json(
        {
            myProfile
        }
    )
})

const getProfile = asyncHandler( async (req, res) => {
    
})

const createProfile = asyncHandler( async (req, res) => {
    const client = req.user
    //Get the user and check if they already have a profile

    const user = await prisma.user.findUnique(
        {
            where: {
                id: client.id
            },
            include: {
                profile: true
            }
        }
    )

    if (user.profile.length) {
        return res.status(403).json(
            {
                error: "Forbidden"
            }
        )
    }

    const profile = await prisma.profile.create(
        {
            data: {
                owner: {connect: {id: client.id}}
            }
        }
    )

    res.status(201).json(
        {
            profile
        }
    )


})

const updateProfile = asyncHandler( async (req, res) => {
    
})

const deleteProfile = asyncHandler( async (req, res) => {
    
})

export default {
    getProfiles,
    getMyProfile,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile
}