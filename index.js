import express from "express";
import { configDotenv } from "dotenv";
import session from "express-session";
import passport from "passport";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import { localStrategy } from "./config/passportLocalStrategy.js";
import { jwtStrategy } from "./config/passportJwtStrategy.js";


import cors from 'cors'
import { Server } from "socket.io";
import { createServer } from 'node:http';

import router from './routes/index.js'


configDotenv()

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', //I'm going to have to add an environmental variable for this particular argument so that I properly point it to the hosted Client when it is put up on Netlify
        methods: ['GET', 'POST']
    }
})



const port = 3000;
const prisma = new PrismaClient()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({
    store: new PrismaSessionStore(
        prisma,
        {
            CheckPeriod: 2 * 60 * 1000, 
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    
    ),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}))

passport.use(localStrategy)
passport.use(jwtStrategy)
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done)=> done(null, user.id))
passport.deserializeUser(async (id, done)=> {
    try {
        const user = await prisma.user.findUnique({ where: {id}})
        done(null, user)
    } catch (error) {
        done(error)
    }
})


/**
 * ROUTES GO HERE
 */
app.use('/user', router.user)
app.use('/auth', router.auth)
app.use('/conversation', router.conversation)
app.use('/message', router.message)
app.use('/profile', router.profile)


/**
 * Socket logic
 */
io.on('connection', (socket)=> {
    console.log('A user connected')
    socket.on('disconnect', ()=> {
        console.log('User disconnected')
    })
})



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something Broke!")
})

server.listen(port, () => {
    console.log(`listening on port: ${port}`)
})