import { Router } from "express";
import passport from "passport";

import profileControl from "../controllers/profileControl.js";

const router = Router()

router.get('/profiles', passport.authenticate('jwt', {session: false}), profileControl.getProfiles)
router.get('/mine', passport.authenticate('jwt', {session: false}), profileControl.getMyProfile)
router.get('/:id', passport.authenticate('jwt', {session: false}), profileControl.getProfile)
router.post('/create', passport.authenticate('jwt', {session: false}), profileControl.createProfile)
router.put('/', passport.authenticate('jwt', {session: false}), profileControl.updateProfile) //not including the id param here as the update should only be done by the owner themselves, thus we should just grab the id from req.user
router.delete('/:userId', passport.authenticate('jwt', {session: false}), profileControl.deleteProfile)

export default router