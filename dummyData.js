import pLimit from "p-limit"

const bigDogToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczMTM2NjEyMSwiZXhwIjoxNzMxMzY5NzIxfQ.-AXSPpBBNfReCGq3u8XLhk3UMr1S3KUtKBfSZqC-xM0' //Insert my token after logging in
const littleDogTokens = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTczMTM2NjE0NCwiZXhwIjoxNzMxMzY5NzQ0fQ.m6WVW4skqrMBAvpTtrWELCFuU91RkbbtAgIL4PAVCuw',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTczMTM2NjE2OSwiZXhwIjoxNzMxMzY5NzY5fQ.2yG-gA10FzFVHhoqmFGgYAt8K0NMDWcV2O0g5EIj3WE',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTczMTM2NjE3OCwiZXhwIjoxNzMxMzY5Nzc4fQ.g2c67UYfVSmcTQOV3ehNMjCqzimpCj5_V5gP1PLe-SY'
]

const findUserConversations = async(token) => {

    const response = await fetch(
        'http://localhost:3000/conversation/conversations/mine',
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch conversations')
    }

    const result = await response.json()
    return result.userConversations
}


const sendMessage = async(token, conversationId, messageBody) => {

    const response = await fetch(
        `http://localhost:3000/message/create/conversation/${conversationId}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({body: messageBody})
        }
    )

    if (!response.ok) {
        throw new Error('Failed to send message')
    }

    const result = await response.json()
    return result.message
}



const populateDummyData = async () => {


    try {

        const limit = pLimit(5)
        const conversations = await findUserConversations(bigDogToken)

        const messagePromises = []

        for (const token of littleDogTokens) {
            for (const conversation of conversations) {
                for (let i = 1; i <=5; i++) {
                    const messageBody = `Dummy message numero ${i} from user with token ${token}`

                    messagePromises.push(
                        limit(() => sendMessage(token, conversation.id, messageBody))
                    )
                }
            }
        }

        await Promise.all(messagePromises)

        const updatedConversations = await findUserConversations(bigDogToken)

        console.log('Updated Conversations:', updatedConversations)
    } catch(error) {
        console.error('Error populating dummy data', error)
    }
}


populateDummyData()


/**
 * RawDog function to just add the participants to the conversations
 * 
 * 2, 3, 5
 */
// const addParticipants = async() => {
    

//     const conversations = await findUserConversations(bigDogToken)

//     /**
//      * 
//      */
//     try {
//         for (let i = 0; i < conversations.length; i++) {
//             const response = await fetch(
//                 `http://localhost:3000/conversation/${conversations[i].id}`,
//                 {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${bigDogToken}`
//                     },
//                     body: JSON.stringify(
//                         {
//                             participants: {
//                                 connect: [
//                                     {id: 2},
//                                     {id: 3},
//                                     {id: 5}
//                                 ]
//                             }
//                         }
//                     )
//                 }
//             )

//             if (!response.ok) {
//                 throw new Error(`Could not add users to conversation${conversations[i].id} `)
//             }

//             const result = await response.json()
//             console.log('Success:', result.updatedConversation)
//         }
//     } catch(error) {
//         console.error('error:', error)
//     } 

// }

// addParticipants()