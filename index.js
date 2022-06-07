const express = require('express')
const router = express.Router()
const app = express()
const path = require('path')

const WEEK_FUNCTION = require('./main')
app.use(express.json())
const PORT = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, './public/');
app.use(express.static(publicDirectoryPath));


router.get('/search', async (req, res) => {

    if (!req.query.owner || !req.query.repo) {
        return res.status(402).json({
            error: "Bad request enter owner and repo in query while making request"
        })
    }

    try {

        const data = await WEEK_FUNCTION(req.query.owner, req.query.repo)
        
        if (data.error) {
            return res.status(402).json({
                error: data.error
            })
        } 

        res.status(200).json(data)
    
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }

})

app.use('/', router)

app.listen(PORT, () => {
    console.log('Server is up and running on http://127.0.0.1:' + PORT)
})