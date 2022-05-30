var express = require('express');
var router = express.Router();
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const sendMail = require('../controller/mail')
const db = require('../db/db')
const url = require('url');
const {IsAdmin} = require('../auth/role');


router.use(session({ secret: 'secret' }));
router.use(bodyParser.urlencoded({extended:false}))
router.use(cookieParser('secret'))
router.use(session({ cookie:{maxAge:60000}}))
router.use(flash())

router.get('/',IsAdmin,function(req, res, next){
  res.redirect('/admin/danhsachtaikhoan/TK2')
})

router.get('/danhsachtaikhoan',IsAdmin,function(req, res, next){
  res.redirect('/admin/danhsachtaikhoan/TK2')
})

router.get('/danhsachtaikhoan/:loaiTk',IsAdmin, function(req, res, next) {

  const URL = url.parse(req.url, true);
  const TK = req.params.loaiTk || 'TK1';
  const sql = 'select * from account where username <> "admin" and kind = ?'
  const params = [TK]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.render('danhsachtaikhoan', {userData: data});
  })
});

router.get('/danhsachtaikhoan/user/:id',IsAdmin, function(req, res, next) {
  const sql = 'select * from account where username = ?'
  const id = req.params.id || '';
  const params = [id]
  db.query(sql,params, (err, data, fields) => {
    if (err) throw err;
    console.log(data[0])
    res.render('xemchitiettaikhoan', {data:data[0]});
  })
});




router.get('/lichsugiaodich',IsAdmin, function(req, res, next) {
  
  const sql = 'select * from transaction  ORDER BY delivery_time DESC'
  db.query(sql, (err, data, fields) => {
    if (err) throw err;
    res.render('lichsugiaodich_admin', {transactionData: data});
  })
});

router.get('/xacminhtaikhoan/:username',IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const username=req.params.username || '0';
  const sql = 'update account set kind = "TK2" where username = ?'
  const params = [username]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.redirect('/admin/danhsachtaikhoan/user/'+username)
  })
})

router.get('/lichsugiaodich/:tt',IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const tt=req.params.tt || '0';
  const sql = 'select * from transaction where status=? ORDER BY delivery_time DESC'
  const params = [tt]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.render('lichsugiaodich_admin', {transactionData: data});
  })
});

router.get('/lichsugiaodich/chitietchuyentien/:id', IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const id =req.params.id
  const sql = 'select * from transaction where id = ?'
  const sql2 = 'select * from account where phone = ?'
  
  const params = [id]
  db.query(sql, params, (err, results, fields) => {
    if (err) throw err;
    console.log(results[0])
    db.query(sql2,[results[0].phone],(err_s, results_s, fields_s)=>{
      if (err_s) throw err_s;
      console.log(results_s[0])
      db.query(sql2,[results[0].receiver_phone],(err_r, results_r, fields_r)=>{
        if (err_r) throw err_r;
        console.log(results_r[0])
        res.render('chitietchuyentien_admin', {data: results[0], sData: results_s[0], rData: results_r[0]});
      })
    })
  })
});

router.get('/lichsugiaodichcanhan_admin/:user',IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const user=req.params.user 
  const sql = 'select * from transaction where username = ? ORDER BY delivery_time DESC'
  const params = [user]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.render('lichsugiaodichcanhan_admin', {transactionData: data});
  })
});

router.get('/dongygiaodich/:id', IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const id = req.params.id || '0';

  let id1 = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  
  let today = new Date();
  let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;

  let new_balance1
  let new_balance2

  const sql = 'select * from transaction where id = ?'
  const sql1 = 'update transaction set status = 0 where id = ?'
  const sql2 = 'update account set account_balance = ? where phone = ?'
  const sql3 = 'insert into transaction(id, kind, username, money, fullname, notes, phone, receiver_phone, delivery_time, delivery_fee, status, benchiuphi) values(?,?,?,?,?,?,?,?,?,?,?,?)'
  const params = [id]
  
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    get_inf(data[0].phone, function(data1) {
      if(data[0].account_balance < data[0].money){
        let error = "Số tiền người rút không đủ để thực hiện giao dịch này"
        req.flash('error', error)
        return res.redirect('/admin/lichsugiaodich/chitietruttien/'+id)
      }
      get_inf(data[0].receiver_phone, function(data2) {
        if (data[0].benchiuphi === "Người nhận") {
          new_balance1 = Number(data1.account_balance) - Number(data[0].money)
          new_balance2 = Number(data2.account_balance) + Number(data[0].money) - Number(data[0].delivery_fee)
        }
        else {
          new_balance1 = Number(data1.account_balance) - Number(data[0].money) - Number(data[0].delivery_fee)
          new_balance2 = Number(data2.account_balance) + Number(data[0].money) 
        }

        const params1 = [new_balance1, data1.phone]
        const params2 = [new_balance2, data2.phone]
        const params3 = [id1, 4, data2.username, data[0].money, data2.fullname, data[0].notes, data1.phone, data2.phone, dateTime, data[0].delivery_fee, 0, data[0].benchiuphi]

        db.query(sql1, params)
        db.query(sql2, params1)
        db.query(sql2, params2)
        db.query(sql3, params3)
        
        let message = "Quý khách đã nhận được số tiền: " + data[0].money.toLocaleString() + '  VNĐ' +"\n" 
              +"Số tiền hiện tại của quý khách là: " + new_balance2.toLocaleString() + '  VNĐ'
                    
        sendMail(data2.email,message)

        res.redirect('/admin/lichsugiaodich/chitietchuyentien/'+ id)
      })
    })
    // res.redirect('/admin/lichsugiaodich/chitietchuyentien/'+ id)
  })
})

router.get('/tuchoigiaodich/:id', IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const id = req.params.id || '0';
  const sql = 'update transaction set status = 2 where id = ?'
  const params = [id]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.redirect('/admin/lichsugiaodich/chitietchuyentien/'+ id)
  })
})

router.get('/lichsugiaodich/chitietruttien/:id', IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const id =req.params.id
  const sql = 'select * from transaction where id = ?'
  
  const params = [id]
  db.query(sql, params, (err, results, fields) => {
    if (err) throw err;
    let error = req.flash('error') ||''
    res.render('chitietruttien_admin', {error,data: results[0]});
  })
  // res.render('chitietruttien_admin', {data: results[0], sData: data1, rData: data2});
});

router.get('/dongyruttien/:id', IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const id = req.params.id || '0';

  const sql = 'select * from transaction where id = ?'
  const sql1 = 'update transaction set status = 0 where id = ?'
  const sql2 = 'update account set account_balance = ? where username = ?'
  
  const params = [id]
  
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;

    get_account_balance(data[0].username, function(data1) {
      if(data1.account_balance < data[0].money){
        let error = "Số tiền người rút không đủ để thực hiện giao dịch này"
        req.flash('error', error)
        return res.redirect('/admin/lichsugiaodich/chitietruttien/'+id)
      }
        let new_balance = Number(data1.account_balance) - Number(data[0].money) - Number(data[0].delivery_fee)

        const params1 = [Number(new_balance), data[0].username]
        
        db.query(sql2, params1, (err, results1, fields) => {
          if (err) throw err;
        })

        db.query(sql1, params, (err, results1, fields) => {
          if (err) throw err;
        })

        res.redirect('/admin/lichsugiaodich/chitietruttien/'+ id)
      })
  })
})

router.get('/tuchoiruttien/:id', IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const id = req.params.id || '0';
  const sql = 'update transaction set status = 2 where id = ?'
  const params = [id]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.redirect('/admin/lichsugiaodich/chitietruttien/'+ id)
  })
})

router.get('/mokhoataikhoan/:username',IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const username=req.params.username || '0';

  const sql = 'update account set kind = "TK2", unusual_signin = 0, count_wrongpass = 0 where username = ?'
  const params = [username]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.redirect('/admin/danhsachtaikhoan/user/'+username)
  })
})

router.get('/lichsugiaodich/user/:username', IsAdmin,  function(req, res, next){
  const URL = url.parse(req.url, true);
  const username =req.params.username || '0';

  
  const sql = 'select * from transaction where username = ? ORDER BY delivery_time DESC '
  const params = [username]

  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.render('lichsugiaodich_admin', {transactionData: data})
  })
});

router.get('/bosungtaikhoan/:username',IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const username=req.params.username || '0';

  const sql = 'update account set kind = "TK5" where username = ?'
  const params = [username]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.redirect('/admin/danhsachtaikhoan/user/'+username)
  })
})

router.get('/vohieutaikhoan/:username',IsAdmin, function(req, res, next){
  const URL = url.parse(req.url, true);
  const username=req.params.username || '0';

  const sql = 'update account set kind = "TK3" where username = ?'
  const params = [username]
  db.query(sql, params, (err, data, fields) => {
    if (err) throw err;
    res.redirect('/admin/danhsachtaikhoan/user/'+username)
  })
})

router.get('/lichsugiaodich/chitietnaptien/:id', IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const id =req.params.id
  const sql = 'select * from transaction where id = ?'
  
  const params = [id]
  db.query(sql, params, (err, results, fields) => {
    if (err) throw err;
    res.render('chitietnaptien_admin', {data: results[0]});
  })
});

router.get('/lichsugiaodich/chitietmuamathe/:id', IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const id =req.params.id
  const sql = 'select * from transaction where id = ?'
  
  const params = [id]
  db.query(sql, params, (err, results, fields) => {
    if (err) throw err;
    res.render('chitietmuamathe_admin', {data: results[0]});
  })
});

router.get('/lichsugiaodich/chitietnhantien/:id', IsAdmin, function(req, res, next) {
  const URL = url.parse(req.url, true);
  const id =req.params.id
  const sql = 'select * from transaction where id = ?'
  
  const params = [id]
  db.query(sql, params, (err, results, fields) => {
    if (err) throw err;
    res.render('chitietnhantien_admin', {data: results[0]});
  })
});

function get_inf(phone, callback) {
  let sql = "SELECT * from account where phone = ?";
  db.query(sql, phone, function(err, results){
        if (err){ 
          throw err;
        }
        
        return callback(results[0]);
  })
}

function get_account_balance(username, callback) {
  let sql = "SELECT account_balance from account where username = ?";
  db.query(sql, username, function(err, results){
        if (err){ 
          throw err;
        }
        
        return callback(results[0]);
  })
}

module.exports = router;