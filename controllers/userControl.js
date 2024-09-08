import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getUsers = asyncHandler( async(req, res) => {

})

const getUser = asyncHandler( async(req, res) => {
    
})

const updateUser = asyncHandler( async(req, res) => {
    
})

const deleteUser = asyncHandler( async(req, res) => {
    
})

export default {
    getUsers,
    getUser,
    updateUser,
    deleteUser
}