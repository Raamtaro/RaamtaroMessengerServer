import { Router } from "express";
import passport from "passport";

import messageControl from "../controllers/messageControl.js";

const router = Router()

router.get('/messages', passport.authenticate('jwt', {session: false}), messageControl.getMessages)
router.get('/mine', passport.authenticate('jwt', {session: false}), messageControl.getMyMessages )
router.get('/:id', passport.authenticate('jwt', {session: false}), messageControl.getMessage)
// router.post('/create/conversation/:id', passport.authenticate('jwt', {session: false}), messageControl.createMessage) //Deprecated 
router.post('/create/conversation/:id', passport.authenticate('jwt', {session: false}), messageControl.addMessage)
router.put('/:id', passport.authenticate('jwt', {session: false}), messageControl.editMessage)
router.delete('/:id', passport.authenticate('jwt', {session: false}), messageControl.deleteMessage)

export default router