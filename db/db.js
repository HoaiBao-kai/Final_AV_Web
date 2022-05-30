const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'final_project_web'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err);
    return;
  }
});

module.exports = connection