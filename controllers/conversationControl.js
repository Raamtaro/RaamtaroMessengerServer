import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

import { validationResult } from "express-validator";

const prisma = new PrismaClient()



const getConversations = asyncHandler( async (req, res) => {

    /**
     * Likely just something that will be useful. Since I'm returning every conersation in the db, I'll omit the messages since this will be every conversation. maybe just conversations and titles
     */
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
    /**
     * This should retrieve the conversations which a user has authored (authorId), AND the ones which they've participated in
     * Therefore, we'll use an OR rule - in this case, we'll findMany({where: {OR: [participants contains the user's id, authorId = client.id]}})
     * This will return ALL conversations associated with the user
     */

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
                lastMessageAt: 'desc'
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
    // const client = req.user //Might use later
    /**
     * When we get a single conversation, it is most likely to be in the context of pulling up the conversation for viewing.
     * Therefore, the order in which Messages within said conversation are retrieved is incredibly crucial.
     */
    const id = parseInt(req.params.id)

    const conversation = await prisma.conversation.findUnique(
        {
            where: {
                id: id
            },
            select: {
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
    res.status(201).json({newConversation})


})

const updateConversation = asyncHandler( async (req, res) => { //Add participant to the conversation or change the title
    //Only the author should be able to add a participant to a conversation, so we need the client

    const client = req.user
    const {title, participants} = req.body
    const conversationId = parseInt(req.params.id)
    const updateData = {}

    /**
     *  participants = {participants: {set: [{id: 2}, ... ]}}
     */

    const conversation = await prisma.conversation.findUnique( //since getConversation also uses this, I'm going to create a helper function for it
        {
            where: {
                id: conversationId
            }
        }
    )

    //If that doesn't fail, then conversation exists

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