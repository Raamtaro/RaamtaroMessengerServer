import expressAsyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { configDotenv } from "dotenv";

import { validationResult } from "express-validator";

configDotenv();

const prisma = new PrismaClient()


export default {
    
}