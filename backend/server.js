const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/mas-position', require('./routes/masPosition'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
