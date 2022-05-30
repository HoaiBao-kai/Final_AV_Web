const db = require('../db/db');

function IsLogin(req, res, next) {
    if (req.session.user == null) {
        return res.redirect('/dangnhap')
    }

    const sql = 'select * from account where username = ?'

    db.query(sql, req.session.user.username, (err, data, fields) => {
        if(data[0].reset_password === 1){
            return res.redirect('/users/doimatkhaulandau');
        }
    })
    if (req.session.user.role != "User") {
        return res.render('khongchophepgiaodich',{message:'Không thể truy cập trang.'})
    }
    
    next()
}

function IsAdmin(req, res, next){
    if (req.session.user == null) {
        return res.redirect('/dangnhap')
    }
    if (req.session.user.role != "Admin") {
        return res.render('khongchophepgiaodich',{message:'Không thể truy cập trang.'})
    }
    next()
}

function transaction_accept(req, res, next) {
    if (req.session.user.kind != 'TK2') {
        return res.render('khongchophepgiaodich',{message:'Tài khoản đang chờ duyệt.'})
    }
    next()
}

module.exports = {IsLogin, IsAdmin,transaction_accept}