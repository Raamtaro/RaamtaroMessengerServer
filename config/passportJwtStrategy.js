import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";
configDotenv();

const prisma = new PrismaClient();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

export const jwtStrategy = new JwtStrategy(opts, async (jwt_payload, done)=> {
    try {
        const user = await prisma.user.findUnique({where: {id: jwt_payload.userId}});
        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    } catch (error) {
        return done(error, false)
    }
})