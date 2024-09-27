import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {
    ensureUploadDirectoryExists,
    fileExists,
    getFilePath,
} from '../services/fileService'

// Define o caminho de upload
const uploadPath = path.join(__dirname, '../uploads')

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadDirectoryExists()
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage }).array('files') // Define o middleware de upload para múltiplos arquivos

// Controlador para upload de arquivos
export const uploadFiles = (req: Request, res: Response): void => {
    try {
        upload(req, res, (err) => {
            if (err) {
                return res
                    .status(400)
                    .json({ message: 'Erro ao enviar arquivos.' })
            }
            if (Array.isArray(req.files) && req.files.length > 0) {
                const filesInfo = (req.files as Express.Multer.File[]).map(
                    (file) => ({
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        path: file.path,
                    })
                )
                return res.status(200).json({
                    message: 'Arquivos enviados com sucesso!',
                    files: filesInfo,
                })
            }
            return res.status(400).json({ message: 'Nenhum arquivo enviado.' })
        })
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}

// Controlador para acessar arquivos
export const getFile = (req: Request, res: Response): void => {
    try {
        const filename = req.params.filename
        const filePath = getFilePath(filename)

        if (fileExists(filename)) {
            return res.sendFile(filePath)
        }

        res.status(404).json({ message: 'Arquivo não encontrado.' })
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}

export const listFiles = (req: Request, res: Response): void => {
    try {
        ensureUploadDirectoryExists()

        const uploadsDir = path.join(__dirname, '../uploads')

        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Erro ao listar arquivos' })
            }
            try {
                // Retornar apenas arquivos, excluindo pastas se houver
                const fileNames = files.filter((file) =>
                    fs.statSync(path.join(uploadsDir, file)).isFile()
                )
                res.json(fileNames)
            } catch (error) {
                return res
                    .status(500)
                    .json({ error: 'Erro ao processar arquivos' })
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}

// apagar arquivo
export const deleteFile = (req: Request, res: Response): void => {
    try {
        const filename = req.params.filename
        const filePath = getFilePath(filename)

        if (fileExists(filename)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: 'Erro ao apagar arquivo' })
                }
                return res.json({ message: 'Arquivo apagado com sucesso' })
            })
        } else {
            res.status(404).json({ message: 'Arquivo não encontrado' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}

// apagar todos os arquivos
export const deleteAllFiles = (req: Request, res: Response): void => {
    try {
        const uploadsDir = path.join(__dirname, '../uploads')

        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: 'Erro ao listar arquivos' })
            }

            files.forEach((file) => {
                const filePath = path.join(uploadsDir, file)
                fs.unlink(filePath, (err) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: 'Erro ao apagar arquivo' })
                    }
                })
            })

            return res.json({
                message: 'Todos os arquivos apagados com sucesso',
            })
        })
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}
