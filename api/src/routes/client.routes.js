import { Router } from 'express';
import { listClients, createClient, getClient, updateClient, deleteClient, listNotes, createNote, deleteNote } from '../controllers/clientController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema, createNoteSchema, clientQuerySchema } from '../validators/client.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/', validateQuery(clientQuerySchema), listClients);
router.post('/', requireFreelancer, validate(createClientSchema), createClient);
router.get('/:id', getClient);
router.patch('/:id', requireFreelancer, validate(updateClientSchema), updateClient);
router.delete('/:id', requireFreelancer, deleteClient);
router.get('/:id/notes', listNotes);
router.post('/:id/notes', requireFreelancer, validate(createNoteSchema), createNote);
router.delete('/:id/notes/:noteId', requireFreelancer, deleteNote);

export default router;
