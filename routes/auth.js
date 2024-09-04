import { Router } from "express";
import passport from "passport";
import authControl from "../controllers/authControl.js";

const router = Router()


router.post('/signup', authControl.userSignup)

export default router