import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()



const getConversations = asyncHandler( async (req, res) => {

    const allConversations = await prisma.conversation.findMany(
        {
            select: {
                id: true,
                authorId: true,
                title: true,
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                messages: true,

            }
        }
    )
    res.status(200).json({
        allConversations
    })
})

const getUserConversations = asyncHandler( async (req, res) => {

    const client = req.user

    const userConversations = await prisma.conversation.findMany(
        {
            where: {
                OR: [
                        {
                            authorId: client.id
                        },
                        {
                            participants: {
                                some: {
                                    id: client.id
                                }
                            }
                        }
                ]
            },
            orderBy: {
                lastMessageAt: {sort: 'desc', nulls: 'last'}
            }
        }
    )
    res.status(200).json(
        {
            userConversations
        }
    )
})

const getConversation = asyncHandler( async (req, res) => {

    const id = parseInt(req.params.id)

    const conversation = await prisma.conversation.findUnique(
        {
            where: {
                id: id
            },
            select: {
                title: true,
                id: true,
                authorId: true,
                participants: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            }
        }
    )

    res.status(200).json(
        {
            conversation
        }
    )
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
    res.status(201).json(
        {
            newConversation
        }
    )


})

const updateConversation = asyncHandler( async (req, res) => { 

    const client = req.user
    const {title, participants} = req.body
    const conversationId = parseInt(req.params.id)
    const updateData = {}

    const conversation = await prisma.conversation.findUnique( //Replace w/helper function
        {
            where: {
                id: conversationId
            }
        }
    )

    if (conversation.authorId !== client.id) {
        return res.status(403).json(
            {
                error: "Unauthorized: Author only action"
            }
        )
    }

    /**
     * Data Prep
     */
    if (title) updateData.title = title
    if (participants) {
        updateData.participants = {
            connect: participants.connect.map(
                (participant) => (
                    {
                        id: parseInt(participant.id)
                    }
                )
            )
        }
    }

    
    /**
     * Start update Request
     */
    const updatedConversation = await prisma.conversation.update(
        {
            where: {
                id: conversationId
            },
            data: {
                ...updateData 
            }
        }
    )
    res.status(200).json(
        {
            message: "Successfully updated conversation",
            updatedConversation
        }
    )
})

const deleteConversation = asyncHandler( async (req, res) => {
    const client = req.user
    const id = parseInt(req.params.id)

    const conversation = await prisma.conversation.findUnique(
        {
            where: {
                id: id
            }
        }
    )

    if (!conversation) {
        return res.status(404).json(
            {
                error: "Resource not found."
            }
        )
    }

    if (conversation.authorId !== client.id) {
        return res.status(403).json(
            {
                error: "Unauthorized request"
            }
        )
    }

    //else, we can go ahead and delete it 
    await prisma.conversation.delete(
        {
            where: {
                id: id
            }
        }
    )

    res.status(200).json(
        {
            message: "Conversation successfully deleted"
        }
    )
})

export default {
    getConversations,
    getUserConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation
}