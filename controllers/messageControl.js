import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { fetchConversation, userInConversation } from "../utils/utils.js";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()

const getMessages = asyncHandler( async(req, res) => {

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

const addMessage = asyncHandler( async(req, res)=> {

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

    res.status(200).json(
        {
            updatedMessage
        }
    )


})

const deleteMessage = asyncHandler( async(req, res) => {

    const client = req.user
    const id = parseInt(req.params.id)

    const message = await prisma.message.findUnique(
        {
            where: {
                id: id
            }
        }
    )

    if (!message) {
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
    addMessage,
    editMessage,
    deleteMessage
}