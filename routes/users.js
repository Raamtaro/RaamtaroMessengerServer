import { Router } from "express";
import passport from "passport";

import userControl from "../controllers/userControl.js";

const router = Router()

router.get('/users', passport.authenticate('jwt', {session: false}), userControl.getUsers)
// router.get()
// router.put()
// router.delete()

export default router