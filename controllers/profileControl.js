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
    const id = parseInt(req.params.id)
    const profile = await prisma.profile.findUnique(
        {
            where: {
                id: id
            }
        }
    )
    res.status(200).json(
        {
            profile
        }
    )
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
    /**
     * Realistically, only the user should be updating their own profile
     */

    const client = req.user
    const {bio} = req.body //I'm going to have to consider cloudinary logic here for uploading files and then including the cloud URL into the data as the pointee in the sql db

    const updateData = {}
    if(bio) {
        updateData.bio = bio
    }

    const updatedProfile = await prisma.profile.update(
        {
            where: {
                ownerId: client.id
            },

            data: {
                ...updateData
            }
        }
    )
    res.status(200).json(
        {
            updatedProfile
        }
    )

})

const deleteProfile = asyncHandler( async (req, res) => {
    /**
     * This would probably only be necessary when we are deleting an account.
     */

    const client = req.user
    const id = parseInt(req.params.userId)

    if (id !== client.id) {
        return res.status(403).json(
            {
                error: "Forbidden"
            }
        )
    }

    await prisma.profile.delete(
        {
            where:
            {
                ownerId: id
            }
        }
    )

    res.status(200).json(
        {
            message: "Profile deleted."
        }
    )
})

export default {
    getProfiles,
    getMyProfile,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile
}