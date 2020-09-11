import express from 'express'
import adminView from '../routes/backend/adminView'

const router = express.Router();

router.get("/", adminView);

export default router;