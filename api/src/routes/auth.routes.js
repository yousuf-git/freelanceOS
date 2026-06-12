import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
