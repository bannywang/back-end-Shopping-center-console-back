const express = require('express')
const session = require('express-session')
const cors = require('cors') //跨來源資源共享模組
const routes = require('./router/routers')
const port = 3100
const multer = require('multer')
const bodyParser = require('body-parser')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const app = express()
const tools = require('./model/tool_model')

//* 啟動ejs
const engine = require('ejs-locals')
app.engine('ejs', engine)
app.set('views', './views')
app.set('view engine', '.ejs')

//架起session跟socket.io的中間橋樑
const sessionMiddleware = session({
    secret: 'cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 生命週期一週
    },
})

// 開啟cors
app.use(
    cors({
        origin: 'http://localhost:8000',
        credentials: true,
    })
)

//靜態檔案放置
app.use(express.static('public'))
//帶入session
app.use(sessionMiddleware)

//帶入bodyParser
app.use(bodyParser.json({ limit: '10mb' })) // 改變 '10mb' 成你需要的大小
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', routes)

//監聽port
app.listen(port, () => {
    console.log(`http://localhost:${port}/stepbrothers/console/login_page`)
})

// 監聽伺服器關閉
process.on('SIGINT', async () => {
    console.log('關閉伺服器')
    try {
        await tools.delete_all_administrator_status()
        console.log('清除所有狀態完成')
    } catch (error) {
        console.error('清除狀態時發生錯誤:', error)
    }
    process.exit(0)
})
