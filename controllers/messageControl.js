import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { fetchConversation, userInConversation } from "../utils/utils.js";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getMessages = asyncHandler( async(req, res) => {
    /**
     * Get all Messages
     */

    const allMessages = await prisma.message.findMany(
        {
            select: {
                id: true,
                conversationId: true,
                authorId: true,
                createdAt: true,

                body: true,                
            }
        }
    )
    res.status(200).json(
        {
            allMessages
        }
    )
})

const getMyMessages = asyncHandler( async(req, res) => {
    /**
     * Get all Messages that have been written by the logged-in user
     */
    const client = req.user
    const myMessages = await prisma.message.findMany(
        {
            where: {
                authorId: client.id
            },
            select: {
                id: true,
                conversationId: true,
                createdAt: true,

                body: true,                
            }
        }
    )
    res.status(200).json(
        {
            myMessages
        }
    )  
})

const getMessage = asyncHandler( async(req, res) => {
    /**
     * Retrieve a single message
     */
    const client = req.user
    const messageId = parseInt(req.params.id)

    const message = await prisma.message.findUnique(
        {
            where: {
                id: messageId
            },
        }
    )

    res.status(200).json(
        {
            message
        }
    )
})

const createMessage = asyncHandler( async(req, res) => {
    /**
     * Write a message
     */
    const client = req.user
    const conversationId = parseInt(req.params.id)
    const {body} = req.body

    const conversation = await fetchConversation(conversationId)

    if (conversation.authorId !== client.id) { 
        
        const verifiedParticipant = userInConversation(conversation.participants, 0, client.id)
        if (!verifiedParticipant) {
            return res.status(403).json(
                {
                    error: "Permission denied"
                }
            )
        }
        
    }

    const message = await prisma.message.create(
        {
            data: {
                body: body,
                author: {connect: {id: client.id}},
                conversation: {connect: {id: conversationId}}
            }
        }
    )
    res.status(201).json(
        {
            message
        }
    )
})

const addMessage = asyncHandler( async(req, res)=> {
    /**
     * This is an updated version of the createMessage handler
     * 
     * Will utilize the $transaction API 
     * -- This is because the Conversation model needs to be updated when a message is added so that it can be retrieved/displayed properly in the Client without having to sort when retrieved
     * So:
     * 
     * 1. Message created
     * 2. Conversation lastMessageAt field is updated
     * 
     * And Conversation Controller for getUserConversations will be updated to orderBy the lastMessageAt field (or the updatedAt field).
     */

    /**
     * Write a message (initial check is the same)
     */
    const client = req.user
    const conversationId = parseInt(req.params.id)
    const {body} = req.body

    const conversation = await fetchConversation(conversationId)

    if (conversation.authorId !== client.id) { 
        const verifiedParticipant = userInConversation(conversation.participants, 0, client.id)
        if (!verifiedParticipant) {
            return res.status(403).json(
                {
                    error: "Permission denied"
                }
            )
        }
    }

    const [message, updatedConversation] = await prisma.$transaction(
        [
            prisma.message.create(
                {
                    data: {
                        body: body,
                        author: {connect: {id: client.id}},
                        conversation: {connect: {id: conversationId}}
                    }
                }
            ),
            prisma.conversation.update(
                {
                    where: {
                        id: conversationId
                    },
                    data: {
                        lastMessageAt: new Date()
                    }
                }
            )
        ]
    )

    res.status(201).json(
        {
            message,
            updatedConversation
        }
    )
})

const editMessage = asyncHandler( async(req, res) => {
    /**
     * Edit Message
     */
    //Only author can edit the conversation
    const client = req.user
    const id = parseInt(req.params.id)
    const {body} = req.body
    
    const message = await prisma.message.findUnique(
        {
            where: {
                id: id
            }
        }
    )

    if(!message) {
        return res.status(404).json(
            {
                error: "Resource not found"
            }
        )
    }

    if (message.authorId !== client.id) {
        return res.status(403).json(
            {
                error: "Unauthorized request"
            }
        )
    }

    const updatedMessage = await prisma.message.update(
        {
            where: {
                id: id
            },
            data: {
                body: body
            },
            select: {
                id: true,

                createdAt: true,
                updatedAt: true,

                body: true,
            }
        }
    )

    res.status(200).status(
        {
            updatedMessage
        }
    )


})

const deleteMessage = asyncHandler( async(req, res) => {
    /**
     * Delete Message
     */
    const client = req.user
    const id = parseInt(req.params.id)

    //Get the Message first
    const message = await prisma.message.findUnique(
        {
            where: {
                id: id
            }
        }
    )

    //Is there a message to delete?
    if (!message) {
        return res.status(404).json(
            {
                error: "Resource not found"
            }
        )
    }

    //Check if it belongs to the user
    if (message.authorId !== client.id) {
        return res.status(403).json(
            {
                error: "Unauthorized request"
            }
        )
    }

    //Go ahead
    await prisma.message.delete(
        {
            where: {
                id: id
            }
        }
    )

    res.status(200).json(
        {
            message: "Message deleted."
        }
    )
})

export default {
    getMessages,
    getMyMessages,
    getMessage,
    createMessage,
    addMessage,
    editMessage,
    deleteMessage
}