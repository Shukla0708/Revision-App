import express from 'express' ; 
import {Login , RefreshToken , Register , googleAuth , googleAuthCallback, Logout, } from '../controllers/authController'   ; 
import passport from 'passport';

const router = express.Router() ; 


export default router ; 

router.post('/login' , Login) ; 
router.post('/register' , Register) ; 
router.get('refresh-token' , RefreshToken) ; 
router.get('/logout' , Logout) ; 
router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);