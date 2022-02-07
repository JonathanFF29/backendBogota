const bcrypt = require('bcrypt-nodejs');

exports.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

exports.comparePassword = (password, savedPassword) => {
    return bcrypt.compareSync(password, savedPassword);
}