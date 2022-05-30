const nodemailer = require("nodemailer");
async function sendMail(email, message) {
    console.log(message)
    console.log("Đang gửi mail")
    let transporter = nodemailer.createTransport({ 
      //   host:  'mail.phongdaotao.com',
      //   port:25,
      //   auth: {
      //     user: 'sinhvien@phongdaotao.com', 
      //     pass: 'svtdtu', 
      //   },
      //   tls: {
      //       rejectUnauthorized: false
      //     }
      // });
      service:  'gmail',
        auth: {
          user: 'viepay.system@gmail.com', 
          pass: 'Viepay123', 
        },
        tls: {
            rejectUnauthorized: false
          }
      });
      transporter.verify((error, success) => {
        if (error)
          console.error(error)
        else
          console.log('works?', success)
    })
    await transporter.sendMail({
        from: 'ViePay', 
        to: `${email}`, 
        subject: 'ViePay email', 
        text: `${message}`, 
    }, (err)=>{
        if(err){
            console.log(err)
        }
        console.log("Đã gửi mail")
        
    });

}
module.exports = sendMail