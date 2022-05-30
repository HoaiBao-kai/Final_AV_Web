const sendMail = require("./mail");
const totp = require("totp-generator");
let s_time;
let r_time;
let otp = totp("JBSWY3DPEHPK3PXP", { period: 60 })
function sendOTP(email){
    console.log('OPT: ' + otp)
    s_time = new Date().getTime();
    console.log(s_time)
    sendMail(email, otp)
    return otp
}

function checkOTP(uotp){
    r_time = new Date().getTime()
    console.log(r_time)
    let time = r_time-s_time
    if(uotp != otp) {
        console.log('OTP'+otp)
        console.log('OTP'+uotp)
        console.log('Không chấp nhận otp')
        return false
    }
    else{
        if(time>60000){
            console.log('Thời gian không hợp lệ')
            return false;
        } 
        console.log('Chấp nhận OTP')
        otp = totp("JBSWY3DPEHPK3PXP", { period: 60 })
        return true
    }  
}

module.exports = {checkOTP, sendOTP}