var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator')
const {sendOTP, checkOTP} = require('../controller/otp')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const sendMail = require('../controller/mail')
const db = require('../db/db');
const multer=require('multer')
let generator = require('generate-password');

const {IsLogin,transaction_accept} = require('../auth/role');

router.use(session({ secret: 'secret' }));
router.use(bodyParser.urlencoded({extended:false}))
router.use(cookieParser('secret'))
router.use(session({ cookie:{maxAge:60000}}))
router.use(flash())

router.get('/', IsLogin,  function(req, res, next) {

  get_info(req.session.user.username, function (results) {
    res.render('home_user', {soduvi: results.account_balance.toLocaleString(), fullname:req.session.user.fullname});
  })
});


router.get('/chitietmuamathe/:id',IsLogin,function(req,res,next){
  const id = req.params.id;
  const sql = 'select * from transaction where id = ?'
  // const sql1 = 'select * from phone_card where = id_gd = ?'
  const params = [id]

  db.query(sql, params, (err, data, fields) => {
    if (err) {
      return res.send('Không tồn tại id_gd');
    }
    get_phone_card(id, function(results) {
      return res.render('chitietmuamathe', {fullname: req.session.user.fullname, data: data[0], phoneData: results})
    })
  })
})

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null, "public/image")
  },
  
  filename: function(req, file, callback) {
    let math = ["image/png", "image/jpeg", "image/jpg"];
    if (math.indexOf(file.mimetype) === -1) {
      let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
      return ;
    }
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
  
})
const upload=multer({storage: storage})
const user = ''
router.get('/naptien',IsLogin,transaction_accept,  function(req, res, next){
  const user = req.session.user || ''

  const error =  req.flash('error') || ''
  const sotien =  req.flash('sotien') || ''
  const cvv =  req.flash('cvv') || ''
  const ngayhethan =  req.flash('ngayhethan') || ''
  const sothe =  req.flash('sothe') || ''
  res.render('naptien',{username:user.username, fullname:user.fullname ,error, sothe,cvv, sotien, ngayhethan})
});

router.get('/muathedienthoai',IsLogin,transaction_accept,  function(req, res, next){
  const error =  req.flash('error') || ''
  res.render('naptiendienthoai',{fullname:req.session.user.fullname, error})
});

const creditValidator = [
  check('sothe').exists().withMessage('Vui lòng nhập số thẻ')
  .notEmpty().withMessage('Không được để trống số thẻ')
  .isLength({min:6}).withMessage('Số thẻ phải có it nhất 6 ký tự'),

  check('ngayhethan').exists().withMessage('Vui lòng  nhập ngày hết hạn')
  .notEmpty().withMessage('Vui lòng nhập ngày hết hạn')
  .isDate().withMessage('Ngày không hợp lệ'),

  check('cvv').exists().withMessage('Vui lòng nhập cvv')
  .notEmpty().withMessage('Không được để trống cvv')
  .isLength({min:3}).withMessage('Số thẻ phải có it nhất 3 ký tự'),

  check('sotien').exists().withMessage('Vui lòng nhập số tiền')
  .notEmpty().withMessage('Không được để trống số tiền')
]

router.post('/naptien', creditValidator,IsLogin,transaction_accept,  function(req, res, next){
  let result = validationResult(req)
  let message;
  const {sothe,ngayhethan,cvv, sotien} = req.body
  const username = req.session.user.username
  let id = Math.floor(Math.random() * (999999 - 100000)) + 100000;

  let today = new Date();
  let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;

  const sql = 'update account set account_balance  = ? where username = ?';
  const sql1 = 'insert into transaction(id, kind, username, fullname, money, delivery_time, sothe, expiration_date, cvv, status) values(?,?,?,?,?,?,?,?,?,?)'
  const params1 = [id, 0, username, req.session.user.fullname, sotien, dateTime, sothe, ngayhethan, cvv, 0]
  
  if(result.errors.length===0){
    get_info(username, function(results) {
      let new_balance = Number(results.account_balance) + Number(sotien)
      if(sothe==="111111"){
        if(ngayhethan === "2022-10-10"){
          if(cvv == 411){
            const params = [new_balance, username];
            db.query(sql, params);
            db.query(sql1, params1)
            return res.redirect('./chitietnaptien/' + id)
          }
          else{
            message = "Cvv không đúng"
          }
        }else{
          message = "Ngày hết hạn không hợp lệ"
        }
      }else if(sothe==="222222"){
        if(ngayhethan === "2022-11-11"){
          if(cvv == 443){
            if(sotien > 1000000){
              message = "Không thể nạp quá 1 triệu"
            }
            else{
              const params = [new_balance, username];
              db.query(sql, params);
              db.query(sql1, params1)
              return res.redirect('./chitietnaptien/' + id)
            }
          }
          else{
            message = "Cvv không đúng"
          }
        }
        else{
          message = "Ngày hết hạn không hợp lệ"
        }
      }else if(sothe==="333333"){
        console.log(ngayhethan)
        if(ngayhethan === "2022-12-12"){
          if(cvv == 577){
            message = "Thẻ hết tiền"
          }
          else{
            message = "Cvv không đúng"
          }
        }
        else{
          message = "Ngày hết hạn không hợp lệ"
        }
      }else{
        message = "Thẻ này không được hổ trợ"
      }
      req.flash('error', message)
      req.flash('sothe', sothe)
      req.flash('ngayhethan', ngayhethan)
      req.flash('cvv', cvv)
      req.flash('sotien', sotien)
      return res.redirect('../users/naptien')
    })
  }
  else
  {
    result = result.mapped();

    for (fields in result) {
        message = result[fields].msg
        break;
    }
    req.flash('error', message)
    req.flash('sothe', sothe)
    req.flash('cvv', cvv)
    req.flash('ngayhethan', ngayhethan)
    req.flash('sotien', sotien)
    return res.redirect('../users/naptien')
  }

})

router.get('/dangky', (req, res)=>{
  const error = req.flash('error') || ''
  const hoten = req.flash('hoten') || ''
  const email = req.flash('email') || ''
  const ngaysinh = req.flash('ngaysinh') || ''
  const sdt = req.flash('sdt') || ''
  const gioitinh = req.flash('gioitinh') || ''
  const diachi = req.flash('diachi') || ''
  res.render('dangky',{error, hoten, email, ngaysinh, sdt, gioitinh, diachi})
})


router.get('/dangxuat',function(req,res,next){
  res.redirect('/dangnhap')
})

router.get('/ruttien',IsLogin,transaction_accept,  function(req, res, next){
  const error =  req.flash('error') || ''
  const sotien =  req.flash('sotien') || ''
  const cvv =  req.flash('cvv') || ''
  const ngayhethan =  req.flash('ngayhethan') || ''
  const sothe =  req.flash('sothe') || ''
  res.render('ruttien',{error,fullname: req.session.user.fullname, sothe,cvv, sotien, ngayhethan})
});

router.post('/ruttien',IsLogin,transaction_accept,  creditValidator, function(req, res, next){
  let result = validationResult(req)
  const user = req.session.user
  let message;
  const {sothe,ngayhethan,cvv, sotien} = req.body
  let fee = Number(sotien) * (5/100)
  let id = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  const username = req.session.user.username
  
  let today = new Date();
  let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;

  const sql1 = 'update account set account_balance  = ? where username = ?';
  const sql2 = 'insert into transaction(id, kind, username, fullname, money, delivery_fee, sothe, expiration_date, cvv, delivery_time, status) values(?,?,?,?,?,?,?,?,?,?,?)'
  
  if(result.errors.length===0){
    get_info(username, function(results){
      let new_balance = Number(results.account_balance) - Number(sotien) - fee
      count_transaction(username, date, function(data) {
        if (data.solan !== 2) {
          if(sothe==="111111"){
            if(ngayhethan === "2022-10-10"){
              if(cvv == 411){
                if (Number(sotien) % 50000 === 0) {
                  if (Number(results.account_balance) >= (Number(sotien) + (Number(sotien) * 0.05))) {
                    if (Number(sotien) > 5000000) {
                      const params2 = [id, 1, username, user.fullname, Number(sotien), fee, sothe, ngayhethan, cvv, dateTime, 1]
                      db.query(sql2, params2);
                      return res.redirect('./chitietruttien/' + id)
                    }
                    else {
                      const params1 = [new_balance, username];
                      const params3 = [id, 1, username, user.fullname, Number(sotien), fee, sothe, ngayhethan, cvv, dateTime, 0]
      
                      db.query(sql1, params1);
                      db.query(sql2, params3);
                      return res.redirect('./chitietruttien/' + id)
                    }
                  }
                  else {
                    message = "Số tiền trong tài khoản không đủ để thực hiện"
                  }
                }
                else {
                  message = "Số tiền phải là bội số của 50.000đ"
                }
              }
              else{
                message = "Cvv không đúng"
              }
            }else{
              message = "Ngày hết hạn không hợp lệ"
            }
          }
          else{
            message = "Thẻ này không được hổ trợ"
          }
          req.flash('error', message)
          req.flash('sothe', sothe)
          req.flash('ngayhethan', ngayhethan)
          req.flash('cvv', cvv)
          req.flash('sotien', sotien)
          return res.redirect('../users/ruttien')
        }
        else {
          message = 'Không thể thực hiện rút tiền quá 2 lần 1 ngày'
          req.flash('error', message)
          return res.redirect('../users/ruttien')
        }
      })
    })
  }
  else
  {
    result = result.mapped();

    for (fields in result) {
        message = result[fields].msg
        break;
    }
    req.flash('error', message)
    req.flash('sothe', sothe)
    req.flash('cvv', cvv)
    req.flash('ngayhethan', ngayhethan)
    req.flash('sotien', sotien)
    return res.redirect('../users/ruttien')
  }
});

router.get('/lichsugiaodich',IsLogin,  function(req, res, next){
  const sql = 'select * from transaction where username = ? ORDER BY delivery_time DESC '
  const params = [req.session.user.username]

  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.render('lichsugiaodich', {transactionData: data, fullname:req.session.user.fullname})
  })
});

router.get('/chuyentien',IsLogin,transaction_accept,  function(req, res, next){
  const error = req.flash('error') || ''
  const sdt = req.flash('sdt') || ''
  const ghichu = req.flash('ghichu') || ''
  const sotien = req.flash('sotien') || ''
  res.render('chuyentien',{error:error,fullname:req.session.user.fullname, sdt, ghichu, sotien})
});

router.get('/xemthongtincanhan',IsLogin,  function(req, res, next){
  const user = req.session.user

  const sql = 'select * from account where username = ?';
      const params = [req.session.user.username];

      db.query(sql, params, (err, results, fields) => {
          if (err) {
             res.send('Có lỗi xảy ra')
          }
          
             res.render('xemthongtincanhan', {fullname:req.session.user.fullname,data: results[0]})
      })


});


router.get('/khoiphucmatkhau', function(req, res, next){
  res.render('khoiphucmatkhau')
});

const firstResetPassValidator = [
  check('password').exists().withMessage('Vui lòng nhập mật khẩu')
  .notEmpty().withMessage('Không được để trống mật khẩu')
  .isLength({min:6}).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  check('cfpassword').exists().withMessage('Vui lòng xác nhận mật khẩu')
  .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
  .custom((value, {req}) => {
      if (value !== req.body.password) {
          throw new Error('Xác nhận mật khẩu không hợp lệ')
      }
      return true;
  })
]

router.get('/nhapmatkhaumoi',function(req, res, next){
  const OTP = req.flash('OTP') || ''
  const error = req.flash('error') || ''
  const password =  req.flash('password') || ''
  const cfpassword =  req.flash('cfpassword') || ''
  const email =  req.flash('email') || ''
  res.render('nhapmatkhaumoi',{error, password, cfpassword, OTP, email})
});

router.post('/nhapmatkhaumoi', firstResetPassValidator ,function(req, res, next){
  const {email, OTP_user, password, cfpassword} = req.body

  let result = validationResult(req)

  sendOTP(email)


  if(OTP_user){
    if(!checkOTP(OTP_user)){
      const error =  "OTP không hợp lệ ! Vui lòng thử lại !"
      res.render('nhapmatkhaumoi',{error, email, password, cfpassword})
    }else{
      const {email, password} = req.body;
      if(result.errors.length===0){

        const hased = bcrypt.hashSync(password, 10)
        const sql = 'update account set password = ? where email = ?';
        const params = [hased , email];

        db.query(sql, params, (err, results, fields) => {
            if (err) {
                req.flash('error', err.message)
                req.flash('password', password)
                return res.redirect('users/khoiphucmatkhau')
            }
            return res.redirect('/dangnhap')
        })
        return;
      }
      else
      {
        result = result.mapped();

        let message;
        for (fields in result) {
            message = result[fields].msg
            break;
        }

        const {email, password, cfpassword} = req.body;
        req.flash('email', email)
        req.flash('error', message)
        req.flash('password',password)
        req.flash('cfpassword', cfpassword)
        return res.redirect('/users/nhapmatkhaumoi')
      }
    }
  }
  else{
    const error = req.flash('error') || ''
    const password =  req.flash('password') || ''
    const cfpassword =  req.flash('cfpassword') || ''
    const email = req.body.email
    res.render('nhapmatkhaumoi',{email ,error, password, cfpassword})  }
});

const validator = [
  check('hoten').exists().withMessage('Vui lòng nhập tên người dùng')
  .notEmpty().withMessage('Tên người dùng không được trống')
  .isLength({min:6}).withMessage('Tên người dùng không được ít hơn 6 ký tự'),

  check('ngaysinh').exists().withMessage('Vui lòng nhập ngày sinh')
  .notEmpty().withMessage('Ngày sinh không được để trống')
  .isDate().withMessage('Ngày sinh không hợp lệ')
  .custom((value,{req})=>{
    let current=new Date().getFullYear();
    birthday=new Date(value).getFullYear();
    old = current-birthday
    console.log(value)
    if(old<15){
      throw new Error("Ngày sinh không hợp lệ hoặc bạn chưa đủ 15 tuổi")
    }
    return true
  })
  ,

  check('sdt').exists().withMessage('Vui lòng nhập SĐT')
  .notEmpty().withMessage('SĐT không được để trống')
  .isMobilePhone().withMessage('SĐT không hợp lệ')
  .isLength({min:10}).withMessage('SĐT nhập thiếu'),

  check('email').exists().withMessage('Vui lòng nhập email')
  .notEmpty().withMessage('Email không được để trống')
  .isEmail().withMessage('Email không hợp lệ'),


]
router.post('/XemThongTinCaNhan',upload.array('upcmnd',2),IsLogin,(req,res,next)=>{
  const files = req.files;
  console.log('HHAHAHA')
  console.log(files)
  var array=[];
  var array1=[]
  for (let i of files){
    array.push(i.filename)     
  }
  const mattruoc=array[0]
  const matsau=array[1]
  const sql='update account set st_identify_card = ? , nd_identify_card=?  where username = ?'
  const params=[mattruoc,matsau,req.session.user.username]
  db.query(sql, params);
  const sql1='update account set kind = ?  where username = ?'
  const params1=['TK1',req.session.user.username]
  db.query(sql1, params1);
  return res.redirect('XemThongTinCaNhan')

})
router.post('/dangky',upload.array('cmnd',2),validator, (req, res,next)=>{
  const files = req.files;
  var array=[];
  var array1=[]
  for (let i of files){
  
      array.push(i.filename)
      
  }
  console.log(files)
 
  let password = generator.generate({
    length: 6,
    numbers: true
  });
  let result = validationResult(req)
  let message
  let username = Math.floor(Math.random() * (9999999999 - 1000000000)) + 1000000000;

  let mailMess = "Tên đang nhập:" + username + "\n" + "Mật khẩu là:"+ password
  
  if(result.errors.length === 0){
      const {hoten, email, sdt, ngaysinh, diachi, gioitinh} = req.body
 
      const hased = bcrypt.hashSync(password, 10)
      const mattruoc=array[0]
      const matsau=array[1]
      let today = new Date();
      let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let thoigian = date+' '+time;
      let current = new Date(thoigian); 
      const sql = 'insert into account(username,account_day,role, phone, email, fullname, sex, birthday, address, password, reset_password,account_balance, withdraw_accept,kind,st_identify_card,nd_identify_card)'+
      'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
      const params = [username,current,'User', sdt, email, hoten, gioitinh, ngaysinh, diachi, hased, 1,0, 2,'TK1',mattruoc,matsau]
      db.query(sql, params,(err, result, fields)=>{
          if(err){
              message = 'Có lỗi không xác định';
              console.log(err.code)
              console.log(err.message)
              if(err.code === 'ER_DATA_TOO_LONG'){
                message = 'Số điện thoại không hợp lệ'
              }
              else if(err.code === 'ER_DUP_ENTRY'){
                message = 'Số điện thoại hoặc email đã tồn tại'
              }
              req.flash('error',message)
              req.flash('hoten',hoten)
              req.flash('sdt',sdt)
              req.flash('email',email)
              req.flash('ngaysinh',ngaysinh)
              req.flash('gioitinh',gioitinh)
              req.flash('diachi',diachi)
              return res.redirect('/users/dangky')
          }
          sendMail(email,mailMess)
          return res.redirect('/dangnhap')
      })
      return;}


  result = result.mapped()

  for(fields in  result){
      message = result[fields].msg
      break;
  }
  console.log(message)

  const {hoten, email, sdt, ngaysinh, gioitinh, diachi} = req.body
  req.flash('error',message)
  req.flash('hoten',hoten)
  req.flash('sdt',sdt)
  req.flash('email',email)
  req.flash('ngaysinh',ngaysinh)
  req.flash('gioitinh',gioitinh)
  req.flash('diachi',diachi)
  res.redirect('/users/dangky')
})

router.get('/doimatkhaulandau',  function(req, res, next){
  const error =  req.flash('error') || ''
  return res.render('doimatkhaulandau',{error})
});


router.post('/doimatkhaulandau',  firstResetPassValidator, (req, res) => {
  if(!req.session.user){
    return res.redirect('/')
  }
  let result = validationResult(req);

  if (result.errors.length === 0) {
      const user = req.session.user
      const {password, cfpassword} = req.body;
      const hased = bcrypt.hashSync(password, 10)

      const sql = 'update account set reset_password = 0, password = ? where username = ?';
      const params = [hased , user.username];

      db.query(sql, params, (err, results, fields) => {
          if (err) {
              req.flash('error', err.message)
              req.flash('password', password)
              req.flash('cfpassword', cfpassword)
              return res.redirect('/users/doimatkhaulandau')
          }
          else if (results.length === 0) {
              req.flash('error', 'Mật khẩu không khớp')
              req.flash('password', password)
              req.flash('cfpassword', cfpassword)
              return res.redirect('/users/doimatkhaulandau')
          }
          else {
              return res.redirect('/')
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

      const {password, cfpassword} = req.body;

      req.flash('error', message)
      req.flash('password',password)
      req.flash('cfpassword', cfpassword)
      return res.redirect('/users/doimatkhaulandau')
      }
})

const resetPassValidator = [
  check('password').exists().withMessage('Vui lòng nhập mật khẩu hiện tại')
  .notEmpty().withMessage('Không được để trống mật khẩu hiện tại')
  .isLength({min:6}).withMessage('Mật khẩu hiện tại phải có ít nhất 6 ký tự'),

  check('newpassword').exists().withMessage('Vui lòng nhập mật khẩu mới')
  .notEmpty().withMessage('Không được để trống mật khẩu mới')
  .isLength({min:6}).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),

  check('cfpassword').exists().withMessage('Vui lòng xác nhận mật khẩu')
  .notEmpty().withMessage('Vui lòng xác nhận mật khẩu')
  .custom((value, {req}) => {
      if (value !== req.body.newpassword) {
          throw new Error('Xác nhận mật khẩu không hợp lệ')
      }
      return true;
  })
]

router.post('/doimatkhau',IsLogin,  resetPassValidator, (req, res) => {
  let result = validationResult(req);

  if (result.errors.length === 0) {
      const user = req.session.user
      const {password, newpassword, cfpassword} = req.body;
      const hasednewpw = bcrypt.hashSync(newpassword, 10)

      const sql = 'update account set password = ? where username = ?';
      const params = [hasednewpw , user.username];
      const sql2 = 'select * from account where username = ?';
      const params2 = [user.username];
      
      db.query(sql2,params2,(err, results, fields)=>{
        const hashed = results[0].password
        const check = bcrypt.compareSync(password, hashed)
        if (!check) {
            req.flash('error', 'Mật khẩu hiện tại không hợp lệ')
            req.flash('password', password)
            return res.redirect('/users/doimatkhau')
        }

        db.query(sql, params, (err, results, fields) => {
          if (err) {
              req.flash('error', err.message)
              req.flash('password', password)
              req.flash('newpassword', newpassword)
              req.flash('cfpassword', cfpassword)
              return res.redirect('/users/doimatkhau')
          }
          else if (results.length === 0) {
              req.flash('error', 'Mật khẩu không khớp')
              req.flash('password', password)
              req.flash('newpassword', newpassword)
              req.flash('cfpassword', cfpassword)
              return res.redirect('/users/doimatkhau')
          }
          else {
            
            return res.redirect('/')

          }
        })
        
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

      const {password, newpassword, cfpassword} = req.body;

      req.flash('error', message)
      req.flash('password',password)
      req.flash('newpassword',newpassword)
      req.flash('cfpassword', cfpassword)
      return res.redirect('/users/doimatkhau')
      }
})

router.get('/doimatkhau', IsLogin,(req, res, next)=>{
  const error = req.flash('error') || ''
  return res.render('doimatkhau',{error, fullname:req.session.user.fullname})
})

const chuyenTienPassValidator = [
  check('sdt').exists().withMessage('Vui lòng nhập số điện thoại người nhận')
  .notEmpty().withMessage('Không được để trống số điện thoại người nhận')
  .isLength({min:10}).withMessage('Số điện thoại người nhận phải có 10 ký tự')
  .custom((value, {req}) => {
    if (value === req.session.user.phone) {
        throw new Error('Không thể chuyển tiền cho chính bạn')
    }
    return true;
  }),
  check('sotien').exists().withMessage('Vui lòng nhập số tiền cần chuyển')
  .notEmpty().withMessage('Không được để trống số tiền cần chuyển')
  .isNumeric().withMessage('Số tiền không hợp lệ'),

  check('ghichu').exists().withMessage('Vui lòng nhập ghi chú')
  .notEmpty().withMessage('Không được để trống ghi chú'),
  
]

router.post('/chuyentien',IsLogin,transaction_accept,  chuyenTienPassValidator, (req, res) => {
  let result = validationResult(req);

  if (result.errors.length === 0) {

      let nguoigui = req.session.user.phone +"-"+ req.session.user.fullname
      let {sotien, chiuphichuyen, ghichu, sdt} = req.body
      let today = new Date();
      let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let thoigian = date+' '+time;
      let chiphi = (sotien * 5/100);
      const sql = 'select * from account where phone = ?';
      const params = [req.body.sdt];
      let benthanhtoan;

      get_info(req.session.user.username, function(data) {
        if(chiuphichuyen === "2"){
          benthanhtoan = "Người chuyển"
          
          if (Number(data.account_balance) < (Number(sotien) + Number(chiphi))) {
            req.flash('error', "Không đủ tiền để thực hiện giao dịch")
            req.flash('sdt',sdt)
            req.flash('sotien',sotien)
            req.flash('ghichu', ghichu)
            return res.redirect('/users/chuyentien')
          }
        }
        else {
          benthanhtoan = "Người nhận"
          if (Number(data.account_balance) < Number(sotien)) {
            req.flash('error', "Không đủ tiền để thực hiện giao dịch")
            req.flash('sdt',sdt)
            req.flash('sotien',sotien)
            req.flash('ghichu', ghichu)
            return res.redirect('/users/chuyentien')
          }
        }

        db.query(sql, params, (err, results, fields) => {
            if (err) {
               res.send('Đã có lỗi xảy ra')
            }
            if(results.length){
              let nguoinhan = results[0].phone +"-"+ results[0].fullname
              let email = data.email
              sendOTP(email)
              console.log(nguoigui)
              console.log(nguoinhan)
              const message = ''
              return res.render('xacnhanchuyentien',{sotien: sotien.toLocaleString(),thoigian, benthanhtoan, chiphi, ghichu,fullname:req.session.user.fullname, nguoigui, nguoinhan, email, message})
            }
            else{
              req.flash('error', "Không tìm thấy người nhận")
              req.flash('sdt',sdt)
              req.flash('sotien',sotien)
              req.flash('ghichu', ghichu)
              return res.redirect('/users/chuyentien')
            }
       
        })
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

      const {sdt, sotien, ghichu} = req.body;

      req.flash('error', message)
      req.flash('sdt',sdt)
      req.flash('sotien',sotien)
      req.flash('ghichu', ghichu)
      return res.redirect('/users/chuyentien')
      }
})

router.post('/xacnhanchuyentien',IsLogin,transaction_accept,(req, res)=>{
  const user = req.session.user
  const {nguoinhan, sotien, thoigian, chiphi, benthanhtoan, ghichu, nguoigui, email} = req.body
  let message;
  console.log(nguoigui)
  console.log(nguoinhan)

  let sdt = nguoinhan.slice(0,10)
  let id = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  let id1 = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  const sql = 'update account set account_balance = ? where phone = ?'
  const sql1 = 'insert into transaction(id, kind, username, money, fullname, notes, phone, receiver_phone, delivery_time, delivery_fee, status, benchiuphi) values(?,?,?,?,?,?,?,?,?,?,?,?)'
  const sql2 = 'select email from account where phone = ?'
  if (checkOTP(req.body.OTP)) {
    get_info(user.username, function(results) {
      if (Number(sotien) <= 5000000) {
        get_reciver(sdt, function(data) {
          if (benthanhtoan === 'Người nhận') {
            let new_balance1 = Number(results.account_balance) - Number(sotien)
            let new_balance2 = Number(data.account_balance) + Number(sotien) - Number(chiphi)
            
            const params = [new_balance1, user.phone]
            const params1 = [new_balance2, sdt]
            const params2 = [id, 2, user.username, Number(sotien), user.fullname, ghichu, user.phone, sdt, thoigian, Number(chiphi), 0, benthanhtoan]
            const params3 =[sdt]
            const params4 = [id1, 4, data.username, Number(sotien), user.fullname, ghichu, user.phone, sdt, thoigian, Number(chiphi), 0, benthanhtoan]
            
            db.query(sql, params)
            db.query(sql, params1)
            db.query(sql1, params2)
            db.query(sql1, params4)
            db.query(sql2, params3, (err, results, fields)=>{
              if(err){
                console.log(err)
              }
              message = "Quý khách đã nhận được số tiền: " + sotien.toLocaleString() +"\n" 
              +"Số tiền hiện tại của quý khách là: " + new_balance2.toLocaleString()
              
              
              sendMail(results[0].email,message)
            })
            return res.redirect('/users/chitietchuyentien/' + id)
              
          }
          else {
            let new_balance1 = Number(results.account_balance) - Number(sotien) - Number(chiphi)
            let new_balance2 = Number(data.account_balance) + Number(sotien)
            const params = [new_balance1, user.phone]
            const params1 = [new_balance2, sdt]
            const params2 = [id, 2, user.username, Number(sotien), user.fullname, ghichu, user.phone, sdt, thoigian, Number(chiphi), 0, benthanhtoan]
            const params3 = [id1, 4, data.username, Number(sotien), user.fullname, ghichu, user.phone, sdt, thoigian, Number(chiphi), 0, benthanhtoan]
            const params4 =[sdt]

            db.query(sql, params)
            db.query(sql, params1)
            db.query(sql1, params2)
            db.query(sql1, params3)
            db.query(sql2, params4, (err, results, fields)=>{
              if(err){
                console.log(err)
              }
              message = "Quý khách đã nhận được số tiền: " + sotien +"\n" 
              +"Số tiền hiện tại của quý khách là: " + new_balance2
              
              
              sendMail(results[0].email,message)
            })
            return res.redirect('/users/chitietchuyentien/' + id)  
          }
        })
      }
      else {
        const params3 = [id, 2, user.username, Number(sotien), user.fullname, ghichu, user.phone, sdt, thoigian, Number(chiphi), 1, benthanhtoan]
        db.query(sql1, params3)
        return res.redirect('/users/chitietchuyentien/' + id)
      }
    })
  }
  else {
    message = 'Mã OTP không hợp lệ'
    // console.log(nguoigui)
    console.log(nguoigui)
    console.log(nguoinhan)
    return res.render('xacnhanchuyentien',{sotien: sotien.toLocaleString(),thoigian, benthanhtoan, chiphi, ghichu,fullname:req.session.user.fullname, nguoigui, nguoinhan, email, message})
  }
})


router.get('/xemchitiettaikhoan',IsLogin,  function(req, res, next){
  const user = req.session.user

  const sql = 'select * from account where username = ?';
      const params = [req.session.user.username];

      db.query(sql, params, (err, results, fields) => {
          if (err) {
             res.send('Đã có lỗi xảy ra')
          }
             res.render('xemchitiettaikhoan', {data: results[0]})
      })


});

router.get('/chitietnaptien/:id', IsLogin, function(req, res, next) {
  const id = req.params.id;
  const sql = 'select * from transaction where id = ?'
  const params = [id]

  db.query(sql, params, (err, results, fields) => {
    if (err) {
      return res.send('Không tồn tại id');
    }
    return res.render('chitietnaptien', {fullname: req.session.user.fullname,data: results[0]})
  })
})

router.get('/chitietruttien/:id', IsLogin, function(req, res, next) {
  const id = req.params.id;
  console.log(id)
  const sql = 'select * from transaction where id = ?'
  const params = [id]

  db.query(sql, params, (err, results, fields) => {
    if (err) {
      return res.send('Không tồn tại id');
    } 
    return res.render('chitietruttien', {fullname: req.session.user.fullname,data: results[0]})
  })
})

router.post('/muathedienthoai', IsLogin, function(req, res, next) {
  
  const user = req.session.user;
  const {mang, soluong, gia} = req.body
  let message;

  let fee = 0
  let sotien = Number(gia) * Number(soluong)
  let id = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  const username = user.username
  
  let today = new Date();
  let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;

  const sql1 = 'update account set account_balance  = ? where username = ?';
  const sql2 = 'insert into transaction(id, kind, username, fullname, money, delivery_fee, delivery_time, status, nhamang, menhgia, soluong) values(?,?,?,?,?,?,?,?,?,?,?)'
  const sql3 = 'insert into phone_card(id_gd, idPhone_card, username, delivery_time, network_provider, total_money, number_card, fee) values(?,?,?,?,?,?,?,?)'
  
  get_info(username, function(results) {
    let id_card;
    let new_balance = Number(results.account_balance) - Number(sotien) - Number(fee)

    if (Number(results.account_balance) >= (sotien + fee)) {
      const params1 = [new_balance, username]
      const params2 = [id, 3, username, user.fullname, Number(sotien), Number(fee), dateTime, 0, mang, Number(gia), soluong]

      db.query(sql1, params1, (err, data, fileds) => {
        if (err) throw err;
      });

      db.query(sql2, params2, (err, data, fileds) => {
        if (err) throw err;
      });

      let count = Number(soluong)

      while(count !== 0) {
        if (mang === "Viettel") {
          id_card = '11111' + String(Math.floor(Math.random() * (99999 - 10000)) + 10000);
          const params3 = [id, id_card, username, dateTime, mang, Number(sotien), Number(gia), Number(fee)]

          db.query(sql3, params3, (err, data, fileds) => {
            if (err) throw err;
          });
        }
        else if (mang === "Mobifone") {
          id_card = '22222' + String(Math.floor(Math.random() * (99999 - 10000)) + 10000);
          const params3 = [id, id_card, username, dateTime, mang, Number(sotien), Number(gia), Number(fee)]

          db.query(sql3, params3, (err, data, fileds) => {
            if (err) throw err;
          });
        }
        else {
          id_card = '33333' + String(Math.floor(Math.random() * (99999 - 10000)) + 10000);
          const params3 = [id, id_card, username, dateTime, mang, Number(sotien), Number(gia), Number(fee)]

          db.query(sql3, params3, (err, data, fileds) => {
            if (err) throw err;
          });
        }
        count = count - 1;
      }

      return res.redirect('./chitietmuamathe/' + id)
    }
    else {
      message = "Số dư tài khoản không đủ để thực hiện"
    }
    req.flash('error', message)
    return res.redirect('../users/muathedienthoai')
  })

})

router.get('/chitietchuyentien/:id',IsLogin,function(req,res,next){
  const id = req.params.id;
  const sql = 'select * from transaction where id = ?'
  const params = [id]

  db.query(sql, params, (err, results, fields) => {
    if (err) {
      return res.send('Không tồn tại id_gd');
    }
    get_reciver(results[0].receiver_phone, function(dataR) {
      return res.render('chitietchuyentien', {fullname: req.session.user.fullname, data: results[0], rData: dataR})
    })
  })
})

router.get('/chitietnhantien/:id',IsLogin,function(req,res,next){
  const id = req.params.id;
  const sql = 'select * from transaction where id = ?'
  const params = [id]

  db.query(sql, params, (err, results, fields) => {
    if (err) {
      return res.send('Không tồn tại id_gd');
    }
    get_reciver(results[0].phone, function(dataR) {
      return res.render('chitietnhantien', {fullname: req.session.user.fullname, data: results[0], rData: dataR})
    })
  })
})


function get_info(username,callback){    
  let sql = "SELECT * from account where username = ?";
  db.query(sql, username, function(err, results){
        if (err){ 
          throw err;
        }
        
        return callback(results[0]);
  })
}

function get_id(callback) {
  let sql = "SELECT id from transaction";
  db.query(sql, function(err, results){
        if (err){ 
          throw err;
        }
        
        return callback(results[0]);
  })
}

function get_phone_card(id, callback) {
  let sql = "SELECT * from phone_card where id_gd = ?";
  db.query(sql, id, function(err, results){
        if (err){ 
          throw err;
        }
        
        return callback(results);
  })
}

function get_reciver(phone, callback) {
  let sql = "SELECT * from account where phone = ?";
  db.query(sql, phone, function(err, results){
        if (err){ 
          throw err;
        }
        
        return callback(results[0]);
  })
}

function count_transaction(username, date, callback) {
  let sql = 'select count(id) as solan from transaction where username = ? and date(delivery_time) = ? and kind = 1'

  let params = [username, date]
  db.query(sql, params, function(err, results){
    if (err){ 
      throw err;
    }
    
    return callback(results[0]);
})
}


module.exports = router;
