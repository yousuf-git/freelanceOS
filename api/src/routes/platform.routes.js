import { Router } from 'express';
import { listPlatforms, createPlatform, getPlatform, updatePlatform, deletePlatform } from '../controllers/platformController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPlatformSchema, updatePlatformSchema } from '../validators/platform.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/', listPlatforms);
router.post('/', requireFreelancer, validate(createPlatformSchema), createPlatform);
router.get('/:id', getPlatform);
router.patch('/:id', requireFreelancer, validate(updatePlatformSchema), updatePlatform);
router.delete('/:id', requireFreelancer, deletePlatform);

export default router;
