import express from 'express'
import fileRoutes from './routes/fileRoutes'
import path from 'path'
import router from './routes/fileRoutes'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/file', fileRoutes)
app.use(router)
app.use(express.static(path.join(__dirname, '../public')))

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} - http://localhost:${PORT}`)
})
