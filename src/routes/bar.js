import { Router } from 'express';
import { barAlgorithm } from '../service/barAlgorithm.js';

const router = Router();

router.get('/', barAlgorithm, (req, res) => {
  res.json({ success: true });
});

export default router;
