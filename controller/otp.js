const sendMail = require("./mail");
const totp = require("totp-generator");
let s_time;
let r_time;
let otp;
function sendOTP(email){
    otp = totp("JBSWY3DPEHPK3PXP", { period: 60 })
    console.log('OPT: ' + otp)
    s_time = new Date().getTime();
    console.log(s_time)
    sendMail(email, otp)
}

function checkOTP(uotp){
    r_time = new Date().getTime()
    console.log(r_time)
    let time = r_time-s_time
    if(uotp != otp) {
        console.log('Không chấp nhận otp')
        return false
    }
    else{
        if(time>60000){
            console.log('Thời gian không hợp lệ')
            return false;
        } 
        console.log('Chấp nhận OTP')
        return true
    }  
}

module.exports = {checkOTP, sendOTP}