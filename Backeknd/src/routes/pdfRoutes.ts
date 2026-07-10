import { Router } from 'express';
import { exportPdf } from '../controllers/pdfController';

const router = Router();

// POST /api/export/pdf
router.post('/export/pdf', (req, res, next) => {
  try {
    exportPdf(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
