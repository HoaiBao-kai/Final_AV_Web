const sendMail = require("./mail");
const totp = require("totp-generator");

let otp = totp("JBSWY3DPEHPK3PXP", { period: 60 })
function sendOTP(email){
    console.log('OPT: ' + otp)
    sendMail(email, otp)
}

let today = new Date();
let date = today.getFullYear() + '-' +(today.getMonth()+1) + '-' + today.getDate();
let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let thoigian = date+' '+time;
let currentDate = new Date(thoigian); 


function checkOTP(datelucnhan, uotp){
    console.log('OTP check ' + otp)
    console.log('uOTP check '+uotp)
    if(uotp != otp) {
        console.log('Không chấp nhận otp')
        return false
    }
    else{
        let time = datelucnhan - currentDate
        console.log(datelucnhan)
        console.log(currentDate)
        console.log(time)
        if(time>60000){
            return false;
        } 
        console.log('Chấp nhận OTP')
        return true
    }  
}

module.exports = {checkOTP, sendOTP}