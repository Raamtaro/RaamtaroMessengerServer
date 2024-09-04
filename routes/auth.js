import { Router } from "express";
import passport from "passport";
import authControl from "../controllers/authControl.js";

const router = Router()


router.post('/signup', authControl.userSignup)
router.post('/login', authControl.loginUser)
router.post('/logout', authControl.logoutUser)
router.get('/profile', passport.authenticate('jwt', {session: false}), authControl.getProfile)

export default router