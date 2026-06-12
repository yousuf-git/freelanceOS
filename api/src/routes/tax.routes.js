import { Router } from 'express';
import { getTaxConfig, putTaxConfig, getTaxPresets, getTaxLiability } from '../controllers/taxController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { taxConfigSchema, taxLiabilityQuerySchema } from '../validators/tax.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/config', getTaxConfig);
router.put('/config', requireFreelancer, validate(taxConfigSchema), putTaxConfig);
router.get('/presets', requireFreelancer, getTaxPresets);
router.get('/liability', validateQuery(taxLiabilityQuerySchema), getTaxLiability);

export default router;
