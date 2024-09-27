import fs from 'fs'
import path from 'path'

const uploadPath = path.join(__dirname, '../uploads')

// Função para garantir que o diretório de uploads exista
export const ensureUploadDirectoryExists = () => {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true })
    }
}

// Função para verificar se um arquivo existe
export const fileExists = (filename: string): boolean => {
    const filePath = path.join(uploadPath, filename)
    return fs.existsSync(filePath)
}

// Função para obter o caminho do arquivo
export const getFilePath = (filename: string): string => {
    return path.join(uploadPath, filename)
}
