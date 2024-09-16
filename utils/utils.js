import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const fetchConversation = async (conversationId) => {
    return await prisma.conversation.findUnique(
        {
            where: {
                id: conversationId
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
                messages: true,
            }
        }
    )
}

export const userInConversation = (participants, index, clientId) => {
    if (!participants[index]) { //If we've reached the end of the array, exit
        return 0
    }

    //check the current index against client.id, return 1 if all good else recurse
    return participants[index].id === clientId ? 1 : userInConversation(participants, index+1, clientId)
}
