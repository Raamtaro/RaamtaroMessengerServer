import { Router } from "express";
import passport from "passport";

import profileControl from "../controllers/profileControl.js";

const router = Router()

router.get('/profiles', passport.authenticate('jwt', {session: false}), profileControl.getProfiles)
router.get('/myProfile', passport.authenticate('jwt', {session: false}), profileControl.getMyProfile)
router.get('/:id', passport.authenticate('jwt', {session: false}), profileControl.getProfile)
router.post('/create/:userId', passport.authenticate('jwt', {session: false}), profileControl.createProfile)
router.put('/:id', passport.authenticate('jwt', {session: false}), profileControl.updateProfile)
router.delete('/:id', passport.authenticate('jwt', {session: false}), profileControl.deleteProfile)

export default router