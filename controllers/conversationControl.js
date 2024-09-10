import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getConversations = asyncHandler( async (req, res) => {

})

const getConversation = asyncHandler( async (req, res) => {
    
})

const createConversation = asyncHandler( async (req, res) => {
    
})

const updateConversation = asyncHandler( async (req, res) => { 
    
})

const deleteConversation = asyncHandler( async (req, res) => {
    
})

export default {
    getConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation
}