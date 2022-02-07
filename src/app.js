const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql');
const path = require('path');
const myConnection = require('express-myconnection');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const bodyParser = require('body-parser');

const app = express();

// base URL routes
const userBaseRoute = '/user';
const categoryBaseRoute = '/category';
const model3dBaseRoute = '/3d-model';

// importing routes
const userRoutes = require('./routes/userRoute');
const categoryRoutes = require('./routes/categoryRoute');
const model3dRoutes = require('./routes/model3dRoute');

// settings
const port = process.env.port || 3000;
app.set('port', port);

// middleweares 
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/xwww-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data

app.use(cors());
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: 'Test1234',
    //password: 'FrankPassword',
    port: 3306,
    database: 'TestDatabase'
}, 'single'));
app.use(express.urlencoded({ extended: false }));///------mirar, se repite

// routes
app.use(`${userBaseRoute}`, userRoutes); // user routes
app.use(`${categoryBaseRoute}`, categoryRoutes); // category routes
app.use(`${model3dBaseRoute}`, model3dRoutes); // product routes

// static files
app.use(express.static(path.join(__dirname, 'public')));

// starting the server
app.listen(port, () => {
    console.log(`Server on port ${port}`);
});