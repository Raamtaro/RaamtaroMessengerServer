import { Router } from "express";
import passport from "passport";

import userControl from "../controllers/userControl.js";

const router = Router()

router.get('/users', passport.authenticate('jwt', {session: false}), userControl.getUsers)
router.get('/:id', passport.authenticate('jwt', {session: false}), userControl.getUser)
// router.put('/:id', passport.authenticate('jwt', {session: false}), userControl.updateUserPassword)
router.delete('/:id', passport.authenticate('jwt', {session: false}), userControl.deleteUser)

export default router