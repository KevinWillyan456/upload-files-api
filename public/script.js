const uploadForm = document.getElementById('uploadForm')
const fileTableBody = document.querySelector('#fileTable tbody')
const deleteAllButton = document.getElementById('deleteAll')
const progressBar = document.getElementById('progressBar')
const uploadResult = document.getElementById('uploadResult')
const submitButton = uploadForm.querySelector('button[type="submit"]')
const refreshFilesButton = document.getElementById('refreshFiles')
const fileCountElement = document.getElementById('fileCount')
const searchForm = document.getElementById('searchForm')
const searchInput = document.getElementById('searchInput')
const filterType = document.getElementById('filterType')

searchForm.addEventListener('submit', (e) => {
    e.preventDefault()
    listFiles()
})

filterType.addEventListener('change', () => {
    listFiles()
})

// Função para filtrar arquivos
function filterFiles(files, searchQuery, filter) {
    return files.filter((file) => {
        const matchesSearch = file
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesFilter =
            filter === '' ||
            (filter === 'image' && file.match(/\.(jpg|jpeg|png|gif)$/i)) ||
            (filter === 'document' && file.match(/\.(pdf|doc|docx|txt)$/i)) ||
            (filter === 'video' && file.match(/\.(mp4|webm|avi)$/i))
        return matchesSearch && matchesFilter
    })
}

// Função para listar arquivos
async function listFiles() {
    const response = await fetch('/files')
    const files = await response.json()
    const searchQuery = searchInput.value
    const filter = filterType.value

    const filteredFiles = filterFiles(files, searchQuery, filter)
    fileTableBody.innerHTML = ''

    filteredFiles.forEach((file) => {
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td>
                <a href="/uploads/${file}" target="_blank">${file}</a>
            </td>
            <td>
                <button onclick="deleteFile('${file}')">Excluir</button>
            </td>
        `
        fileTableBody.appendChild(tr)
    })

    if (filteredFiles.length === 0) {
        fileTableBody.innerHTML =
            '<tr><td colspan="2">Nenhum arquivo encontrado</td></tr>'
    }

    fileCountElement.textContent = `(${filteredFiles.length})`
}

// Função para excluir um arquivo
async function deleteFile(fileName) {
    if (confirm(`Tem certeza que deseja excluir o arquivo ${fileName}?`)) {
        // Show progress bar
        progressBar.style.display = 'block'
        progressBar.value = 0 // Reset progress bar

        const response = await fetch(`/file/${fileName}`, {
            method: 'DELETE',
        })

        // Simulate progress for delete operation
        let progress = 0
        const interval = setInterval(() => {
            progress += 10
            progressBar.value = progress
            if (progress >= 100) {
                clearInterval(interval)
            }
        }, 100)

        if (response.ok) {
            showUploadResult('Arquivo apagado com sucesso!', 'success')
            listFiles() // Atualiza a lista de arquivos
        } else {
            showUploadResult('Erro ao excluir o arquivo.', 'error')
        }

        // Hide progress bar
        progressBar.style.display = 'none'
    }
}

// Atualizar a lista de arquivos ao clicar no botão "Atualizar"
refreshFilesButton.addEventListener('click', () => {
    // limpa o campo de busca e o filtro
    searchInput.value = ''
    filterType.value = ''
    listFiles()
})

// função para excluir todos os arquivos de uma vez, mas exige confirmação
deleteAllButton.addEventListener('click', async () => {
    if (confirm('Tem certeza que deseja excluir todos os arquivos?')) {
        // Show progress bar
        progressBar.style.display = 'block'
        progressBar.value = 0 // Reset progress bar

        const response = await fetch('/files', {
            method: 'DELETE',
        })

        // Simulate progress for delete operation
        let progress = 0
        const interval = setInterval(() => {
            progress += 10
            progressBar.value = progress
            if (progress >= 100) {
                clearInterval(interval)
            }
        }, 100)

        if (response.ok) {
            showUploadResult(
                'Todos os arquivos foram apagados com sucesso!',
                'success'
            )
            listFiles() // Atualiza a lista de arquivos
        } else {
            showUploadResult('Erro ao excluir os arquivos.', 'error')
        }

        // Hide progress bar
        progressBar.style.display = 'none'
    }
})

// Função para fazer upload de vários arquivos com barra de progresso
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData()
    const fileInput = document.getElementById('fileInput')
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i])
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/upload', true)

    // Show progress bar
    progressBar.style.display = 'block'
    // Disable submit button
    submitButton.disabled = true

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100
            progressBar.value = percentComplete
        }
    }

    xhr.onload = () => {
        if (xhr.status === 200) {
            showUploadResult('Arquivos enviados com sucesso!', 'success')
            fileInput.value = ''
            listFiles() // Atualiza a lista de arquivos
        } else {
            showUploadResult('Erro ao enviar os arquivos.', 'error')
        }
        // Hide progress bar
        progressBar.style.display = 'none'
        progressBar.value = 0 // Reset progress bar
        // Enable submit button
        submitButton.disabled = false
    }

    xhr.send(formData)
})

// Função para exibir o resultado do upload
function showUploadResult(message, type) {
    uploadResult.textContent = message
    uploadResult.className = type // Define a classe como 'success' ou 'error'
    uploadResult.style.display = 'block'
    setTimeout(() => {
        uploadResult.style.display = 'none'
    }, 5000) // Oculta a mensagem após 5 segundos
}

// Listar arquivos ao carregar a página
listFiles()
