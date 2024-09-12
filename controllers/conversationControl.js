import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getConversations = asyncHandler( async (req, res) => {

    /**
     * Likely just something that will be useful. Since I'm returning every conersation in the db, I'll omit the messages since this will be every conversation. maybe just conversations and titles
     */
    const allConversations = await prisma.conversation.findMany()
    res.status(200).json({
        allConversations
    })
})

const getUserConversations = asyncHandler( async (req, res) => {
    /**
     * This should retrieve the conversations which a user has authored (authorId), AND the ones which they've participated in
     * Therefore, we'll use an OR rule - in this case, we'll findMany({where: {OR: [participants contains the user's id, authorId = client.id]}})
     * This will return ALL conversations associated with the user
     */



})

const getConversation = asyncHandler( async (req, res) => {
    
})

const createConversation = asyncHandler( async (req, res) => {
    const client = req.user
    const {title} = req.body
    const conversationData = {}

    if (title) conversationData.title = title

    const newConversation = await prisma.conversation.create(
        {
            data: {
                ...conversationData,
                author: {connect: {id: client.id}}
            },
        }
    )
    res.status(201).json({newConversation})


})

const updateConversation = asyncHandler( async (req, res) => { 
    
})

const deleteConversation = asyncHandler( async (req, res) => {
    
})

export default {
    getConversations,
    getUserConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation
}