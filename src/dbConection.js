var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Test1234',
    port: 3306,
    database: 'TestDatabase',
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected with mysql database...')
});

module.exports = connection;