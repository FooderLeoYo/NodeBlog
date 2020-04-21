let path = require('path')

let express = require('express')
let bodyParser = require('body-parser')
let session = require('express-session')

let router = require('./routers/router')

let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  // secret的作用：配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
  // 目的是为了增加安全性，防止客户端恶意伪造
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true // 设置为true时，无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

app.engine('html', require('express-art-template'));

// 用到__dirname动态获取绝对路径
app.use('/public/', express.static(path.join(__dirname, './public/')));
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')));

app.use(router);

// 配置一个处理 404 的中间件
app.use((req, res) => {
  res.render('404.html')
})

// 配置一个全局错误处理中间件
app.use((err, req, res, next) => {
  res.status(500).json({
    err_code: 500,
    message: err.message
  })
})

app.listen(5000, () => console.log('app is is running ay port 5000'))