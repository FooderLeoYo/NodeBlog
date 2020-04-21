let express = require('express');
let md5 = require('blueimp-md5')

let User = require('../datamodels/user')

let router = express.Router();

/* 渲染首页 */
// user: req.session.user将新注册用户的信息传递给首页
router.get('/', (req, res) => res.render('index.html', { user: req.session.user }));

/* 渲染登录页 */
router.get('/login/', (req, res) => res.render('login.html'));

/* 处理登录请求 */
router.post('/login/', (req, res, next) => {
  let body = req.body

  User.findOne({
    email: body.email,
    password: md5(md5(body.password))
  }, (err, data) => {
    // 全局错误处理中间件
    if (err) return next(err)

    // 如果找不到该用户
    if (!data) {
      return res.status(200).json({
        err_code: 1,
        message: 'Email or password is invalid.'
      })
    }

    // 用户存在，登陆成功，通过 Session 记录登陆状态
    req.session.user = data

    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  })
})

/* 渲染注册页 */
router.get('/register/', (req, res) => res.render('register.html'));

/* 处理注册请求 */
// 由于这里会调用多个异步处理方法，因此采用async函数
router.post('/register', async (req, res, next) => {
  let body = req.body
  // try、catch语法捕获异常
  // 这样就不需要向每个可能发生错误的方法都传入一个错误回调，只需要最后有一个catch即可
  try {
    // 判断邮箱是否已存在
    if (await User.findOne({ email: body.email })) {
      return res.status(200).json({
        err_code: 1,
        message: 'email already exist'
      })
    }
    // 判断昵称是否已存在
    if (await User.findOne({ nickname: body.nickname })) {
      return res.status(200).json({
        err_code: 2,
        message: 'nickname already exist'
      })
    }

    // 邮箱或用户名未被注册
    // 对密码进行 md5 双重加密
    body.password = md5(md5(body.password))
    // 将注册请求数据保存到数据库，创建用户，执行注册
    let newUser = new User(body)
    await newUser.save()
    // 注册成功，使用 Session 记录用户的新注册用户的信息
    req.session.user = newUser
    // 发送响应
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  } catch (err) {
    // 全局错误处理中间件
    next(err)
  }
})

/* 处理登出请求 */
router.get('/logout', function (req, res) {
  // 清除登陆状态
  req.session.user = null

  // 重定向到登录页
  res.redirect('/login')
})

module.exports = router;
