import { Router } from 'express';
import { register, login, refreshToken, logout, me } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', me);

export default router;
import express from 'express';
import dotenv from 'dotenv';