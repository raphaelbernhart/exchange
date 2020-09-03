import express from 'express'
import uploadView from '../routes/uploadView'
import upload from '../routes/upload'
import fileAccess from '../routes/fileAccess'

const router = express.Router();

router.get("/", uploadView);
router.post("/upload", upload);
router.get("/:id", fileAccess);

export default router;