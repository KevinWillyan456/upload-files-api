import express from 'express'
import {
    deleteAllFiles,
    deleteFile,
    getFile,
    listFiles,
    uploadFiles,
} from '../controllers/fileController'

const router = express.Router()

// Rota para listar arquivos
router.get('/files', listFiles)

// Rota para upload
router.post('/upload', uploadFiles)

// Rota para acessar um arquivo específico
router.get('/file/:filename', getFile)

// Rota para deletar um arquivo
router.delete('/file/:filename', deleteFile)

// Rota para deletar todos os arquivos
router.delete('/files', deleteAllFiles)

export default router
