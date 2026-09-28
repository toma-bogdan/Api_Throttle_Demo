import { Router } from 'express';
import fooAlgorithm from '../service/fooAlgorithm.js';

const router = Router();

router.get('/', fooAlgorithm, (req, res) => {
  res.json({ success: true });
});

export default router;
