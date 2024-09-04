import express from "express";
import { configDotenv } from "dotenv";
import session from "express-session";
import passport from "passport";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import { localStrategy } from "./config/passportLocalStrategy.js";
import { jwtStrategy } from "./config/passportJwtStrategy.js";

import router from './routes/index.js'


const app = express()
const port = 3000;
const prisma = new PrismaClient()

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



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something Broke!")
})

app.listen(port, () => {
    console.log(`listening on port: ${port}`)
})