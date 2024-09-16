import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getProfiles = asyncHandler( async (req, res) => {

})

const getMyProfile = asyncHandler( async (req, res) => {
    
})

const getProfile = asyncHandler( async (req, res) => {
    
})

const createProfile = asyncHandler( async (req, res) => {
    
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