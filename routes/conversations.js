import { Router } from "express";
import passport from "passport";
import conversationControl from "../controllers/conversationControl.js";


const router = Router()

router.get('/conversations', passport.authenticate('jwt', {session: false}), conversationControl.getConversations)
router.get('/:id', passport.authenticate('jwt', {session: false}), conversationControl.getConversation)
router.post('/create', passport.authenticate('jwt', {session: false}), conversationControl.createConversation)
router.put('/:id', passport.authenticate('jwt', {session: false}), conversationControl.updateConversation)
router.delete('/:id', passport.authenticate('jwt', {session: false}), conversationControl.deleteConversation)

export default router