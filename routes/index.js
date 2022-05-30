var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const db = require('../db/db');

router.use(session({ secret: 'secret' }));
router.use(bodyParser.urlencoded({extended:false}))
router.use(cookieParser('secret'))
router.use(session({ cookie:{maxAge:60000}}))
router.use(flash())


router.get('/', function(req, res, next) {
  if(!req.session.user){
    return res.redirect('/dangnhap')
  }
  if(req.session.user.role === 'Admin'){
    return res.redirect('/admin/')
  }
  return res.redirect('/users/')
});



const loginValidator = [
  check('username').exists().withMessage('Vui lòng nhập username')
  .notEmpty().withMessage('Không được để trống username'),

  check('password').exists().withMessage('Vui lòng nhập mật khẩu')
  .notEmpty().withMessage('Không được để trống mật khẩu')
  .isLength({min:6}).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
]

router.get('/dangnhap', (req, res, next) => {
  const error = req.flash('error') || ''
  const username = req.flash('username') || ''
  res.render('dangnhap', {error, username})
})

router.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.redirect('/dangnhap')
})

router.post('/dangnhap', loginValidator, (req, res, next) => {
  if (result.errors.length === 0) {
      const {username, password} = req.body;

      const sql = 'select * from account where username = ?';
      const params = [username];

      db.query(sql, params, (err, results, fields) => {
          if (err) {
              req.flash('error', err.message)
              req.flash('password', password)
              req.flash('username', username)
              return res.redirect('/dangnhap')
          }
          else if (results.length === 0) {
              req.flash('error', 'User không tồn tại')
              req.flash('password', password)
              req.flash('username', username)
              return res.redirect('/dangnhap')
          }
          else {
            const hashed = results[0].password
            const check = bcrypt.compareSync(password, hashed)
            const count = results[0].count_wrongpass || 0 
            console.log(count)

            if(results[0].kind === 'TK4'){
              req.flash('error', 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ')
              return res.redirect('/dangnhap')
            }
            let current = new Date().getTime();
            let dDate = new Date(results[0].lock_account_day).getTime();
            let time = current - dDate;
            console.log(time)
            
            if(results[0].unusual_signin === 1 && time <6000){
              console.log('Chặn')
              req.flash('error', 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút')
              return res.redirect('/dangnhap')
            }
            
            if (!check){
              if(count === 2){
                req.flash('error', 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút')
                req.flash('password', password)
                req.flash('username', username)
                current = new Date();
                updateUnusual(1,username,current)
                countWrongPass(count, username)
                return res.redirect('/dangnhap')
              }
              if(count === 5){
                req.flash('error', 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ')
                req.flash('password', password)
                req.flash('username', username)
                countWrongPass(count, username)
                current = new Date();
                lockAccount("TK4", username, current)
                return res.redirect('/dangnhap')
              }
                req.flash('error', 'Mật khẩu không đúng')
                req.flash('password', password)
                req.flash('username', username)
                countWrongPass(count, username)
                return res.redirect('/dangnhap')
            }else{
              let user = results[0]
              req.session.user = user

              if (results[0].unusual_signin === 1 || results[0].count_wrongpass !== 0) {
                const sql2 = 'update account set kind = "TK2", unusual_signin = 0, count_wrongpass = 0 where username = ?';
                const params2 = [username];
                db.query(sql2, params2)
              }
              return res.redirect('/')
            }
          }
      })
  }
  else
  {
      result = result.mapped();

      let message;
      for (fields in result) {
          message = result[fields].msg
          break;
      }

      const {username, password} = req.body;

      req.flash('error', message)
      req.flash('password',password)
      req.flash('username', username)
      return res.redirect('/dangnhap')
      }
})


function countWrongPass(count, username) {
  const sql = 'update account set count_wrongpass = (? + 1) where username = ?';
  const params = [count, username];

  db.query(sql, params);
}

function lockAccount(kind, username, dateTime) {
  const sql = 'update account set lock_account_day = ?, kind  = ? where username = ?';
  const params = [dateTime, kind, username];
  db.query(sql, params);
}

function updateUnusual(count, username, dateTime) {
  const sql = 'update account set unusual_signin = ?,lock_account_day = ? where username = ?';
  const params = [count,dateTime, username];

  db.query(sql, params);
}

function resetLock(username) {
  const sql = 'update account set count_wrongpass = 0, unusual_signin = 0 where username = ?';
  const params = [username];

  db.query(sql, params);
}

module.exports = router;
