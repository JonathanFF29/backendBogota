const Encrypt = require('./encrypt-password');
const jwt = require('jsonwebtoken');
const Config = require('../config');
const nodemailer = require('nodemailer');
const path = require('path');
var sql = require('../dbConection');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
    secure: false,
    auth: {
        user: "test@test.co",
        pass: "test"
    },
    tls: {
        rejectUnauthorized: false
    }
});

const controller = {};

controller.message = (req, res) => {
    res.redirect('https://www.test.co/msg.jpg')
}

controller.updateUser = (req, res) => {
    const requestData = req.body;
    const data = {
        id: requestData.id,
        name: requestData.name,
        roleId: requestData.role
    }

    const queries = `UPDATE user SET name="${data.name}" WHERE user.id=${data.id};
                        UPDATE user_role ur SET role_id=${data.roleId} WHERE ur.user_id=${data.id}`;
    sql.query(queries, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ message: "User updated successfully" });
        }
    });
}

controller.getUser = (req, res) => {
    const requestData = req.body;
    const userId = requestData.id;
    const query = `SELECT u.*, r.name AS role
                    FROM user u
                    INNER JOIN user_role ur ON u.id=ur.user_id
                    INNER JOIN role r ON ur.role_id=r.id
                    WHERE u.id=${userId};`;
    sql.query(query, async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ user: result[0] });
        }
    });
};

controller.getCompanyUsers = (req, res) => {
    const query = `SELECT U.id, U.name 
                    From user U, role R, user_role UR
                    WHERE U.id=UR.user_id and UR.role_id=R.id and R.name="Empresa"`;
    sql.query(query, async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ users: result });
        }
    });
}

controller.addUserRole = (req, res) => {
    const requestData = req.body;
    const data = {
        name: requestData.name,
        description: requestData.description
    }

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query('INSERT INTO role set ?', [data], (err, role) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Role added successfully" });
                }
            });
        }
    });
}

controller.getUserRoles = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query('SELECT * FROM role', (err, roles) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).send(roles);
                }
            });
        }
    });
}

controller.createTag = (req, res) => {
    const requestData = req.body;
    const data = {
        name: requestData.name,
        imagePath: ""
    }
    let reqFile = req.file || null;
    if (reqFile) data.imagePath = reqFile.path;

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query('INSERT INTO tag set ?', [data], (err, role) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Tag added successfully" });
                }
            });
        }
    });
}

controller.addUserTags = (req, res) => {
    const requestData = req.body;
    let userId = req.id;
    let tagsIds = requestData.tags;

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            var query1 = `DELETE FROM user_tag WHERE user_id='${userId}'`;
            var query2 = "INSERT INTO user_tag (user_id, tag_id) VALUES ?";
            var values = [];
            tagsIds.forEach(tagId => {
                values.push([`${userId}`, `${tagId}`]);
            });

            conn.query(query1, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    if (values.length > 0) {
                        conn.query(query2, [values], (err, result) => {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({ message: "Tags added successfully" });
                            }
                        });
                    } else
                        res.status(200).json({ message: "Tags updated successfully" });
                }
            });
        }
    });
}

controller.getUserTags = (req, res) => {
    let userId = req.id;
    let idsResponse = [];

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            var query = `SELECT tag_id FROM user_tag WHERE user_id='${userId}'`;
            conn.query(query, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    result.forEach(e => {
                        idsResponse.push(e.tag_id);
                    })

                    res.status(200).json({ tags: idsResponse });
                }
            });
        }
    });
}

controller.getTags = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query("SELECT * FROM tag;", (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(result);
                }
            });
        }
    });
}

controller.list = (req, res) => {
    const query = `SELECT u.*, r.name AS role
                    FROM user u
                    INNER JOIN user_role ur ON u.id=ur.user_id
                    INNER JOIN role r ON ur.role_id=r.id;`;
    sql.query(query, async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ users: result });
        }
    });
};

controller.signup = (req, res) => {
    const requestData = req.body;
    //console.log(req.body);
    const data1 = {
        email: requestData.email,
        password: Encrypt.encryptPassword(requestData.password),
        date: new Date(),
        name: requestData.name || "",
        gender: requestData.gender || "",
        birthdate: new Date(requestData.birthdate) || "",
        picture: "",
        country: requestData.country || "",
        city: requestData.city || "",
        profession: requestData.profession || ""
    }

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query('INSERT INTO user set ?', [data1], async(err, result1) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    conn.query(`SELECT id FROM user WHERE email='${data1.email}'`, (err, result2) => {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            const user_id = result2[0].id;
                            let data2 = { user_id };
                            data2.role_id = 2;
                            conn.query('INSERT INTO user_role set ?', [data2], (err, result3) => {
                                if (err) {
                                    res.status(500).json(err);
                                } else {
                                    jwt.sign({ id: user_id }, Config.JWT_KEY, { expiresIn: 60 * 60 * 24 }, (err, emailToken) => {
                                        if (err) {
                                            return res.status(500).json({
                                                err,
                                                message: "Error de validación"
                                            })
                                        } else {
                                            const url = `https://backend.test.co/user/confirm/${emailToken}`;
                                            const mailOptions = {
                                                from: 'test@test.co',
                                                to: requestData.email,
                                                subject: 'Bienvenido(a) a test',
                                                html: `<div style="position: relative; width: 100%;">
                                                       <a href="${url}">
                                                       <img src="https://backend.test.co/email/emailConfirmation.jpg" alt="" style="width: 100%; height: auto;">
                                                       </a>
                                                       </div>`
                                            };

                                            transporter.sendMail(mailOptions, function(err, info) {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).json({
                                                        err,
                                                        message: "Error al enviar email"
                                                    })
                                                } else {
                                                    console.log(info);
                                                    res.status(200).json({
                                                        message: "User added successfully. Confirmation email sent",
                                                        auth: true,
                                                        accessToken: emailToken
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

controller.confirm = (req, res) => {
    const decoded = jwt.verify(req.params.token, Config.JWT_KEY);

    if (decoded.id) {
        req.getConnection((err, conn) => {
            if (err) {
                res.status(500).json(err);
            } else {
                const query = `UPDATE user SET isActive=1 WHERE id='${decoded.id}'`;
                conn.query(query, (err, result) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.sendFile(path.join(__dirname, '../views/verificationEmailView.html'));
                    }
                });
            }
        });
    } else {
        res.status(500).send('Este link ha expirado');
    }
}

controller.resendConfirmationEmail = (req, res) => {
    const requestEmail = req.body.email;

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query(`SELECT id FROM user WHERE email='${requestEmail}'`, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    const accessToken = jwt.sign({ id: result[0].id }, Config.JWT_KEY, { expiresIn: 60 * 60 * 24 }, (err, emailToken) => {
                        if (err) {
                            return res.status(500).json({
                                err,
                                message: "Error de validación"
                            })
                        } else {
                            const url = `https://backend.test.co/user/confirm/${emailToken}`;
                            const mailOptions = {
                                from: 'test@test.co',
                                to: requestEmail,
                                subject: 'Bienvenido(a) a test',
                                html: `<div style="position: relative; width: 100%;">
                                       <a href="${url}">
                                       <img src="https://backend.test.co/email/emailConfirmation.jpg" alt="" style="width: 100%; height: auto;">
                                       </a>
                                       </div>`
                            };

                            transporter.sendMail(mailOptions, function(err, info) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({
                                        err,
                                        message: "Error al enviar email"
                                    })
                                } else {
                                    console.log(info);
                                    res.status(200).json({ message: "Email sent successfully" });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

controller.login = async (req, res) => {
    const requestData = req.body;
    console.log(req.body);

    let data = {
        email: requestData.email,
        password: requestData.password
    }

    req.getConnection(async(err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            if (requestData.socialNetwork) {
                dataToSave = {
                    email: requestData.email,
                    password: Encrypt.encryptPassword(requestData.password),
                    date: new Date(),
                    name: requestData.name,
                    isFacebook: requestData.socialNetwork === "isFacebook" ? 1 : 0,
                    isGoogle: requestData.socialNetwork === "isGoogle" ? 1 : 0,
                    isActive: 1
                }
                conn.query(`SELECT * FROM user WHERE email='${requestData.email}'`, (err, user) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        if (user == 0) {
                            conn.query('INSERT INTO user set ?', [dataToSave], (err, result1) => {
                                if (err) {
                                    res.status(500).json(err);
                                } else {
                                    conn.query(`SELECT id FROM user WHERE email='${dataToSave.email}'`, (err, result2) => {
                                        if (err) {
                                            res.status(500).json(err);
                                        } else {
                                            const user_id = result2[0].id;
                                            let data2 = { user_id };
                                            data2.role_id = 2;
                                            conn.query('INSERT INTO user_role set ?', [data2], (err, result3) => {
                                                if (err) {
                                                    res.status(500).json(err);
                                                } else {
                                                    const accessToken = jwt.sign({ id: result2[0].id }, Config.JWT_KEY, {
                                                        expiresIn: 60 * 60 * 24 // expires in 24 hours
                                                    });

                                                    res.status(200).json({ auth: true, accessToken });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            const validPassword = Encrypt.comparePassword(data.password, user[0].password);
                            if (!validPassword)
                                return res.status(401).json({ auth: false, token: null, message: "Incorrect password" });

                            const accessToken = jwt.sign({ id: user[0].id }, Config.JWT_KEY, {
                                expiresIn: 60 * 60 * 24 // expires in 24 hours
                            });

                            res.status(200).json({ auth: true, accessToken });
                        }
                    }
                });
            } else {
                conn.query(`SELECT * FROM user WHERE email='${data.email}'`, (err, user) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        if (user == 0)
                            return res.status(404).send("The user doesn't exists");

                        const validPassword = Encrypt.comparePassword(data.password, user[0].password);
                        if (!validPassword)
                            return res.status(401).json({ auth: false, token: null, message: "Incorrect password" });

                        if (user[0].isActive === 0)
                            return res.status(401).send("The user hasn't been confirmed");

                        const accessToken = jwt.sign({ id: user[0].id }, Config.JWT_KEY, {
                            expiresIn: 60 * 60 * 24 // expires in 24 hours
                        });

                        res.status(200).json({ auth: true, accessToken });
                    }
                });
            }
        }
    });
}

controller.getUserInfo = (req, res) => {
    let userId = req.id;
    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const query = `SELECT user.id, user.email, user.date, user.name,user.gender, user.birthdate, 
            user.picture, user.country, user.city, user.profession, user.isActive, user.isFacebook, user.isGoogle,
            role.name AS role, user.description, user.url FROM user, role, user_role WHERE user.id='${userId}' and user.id=user_role.user_id and user_role.role_id=role.id`;
            conn.query(query, (err, user) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).send(user[0]);
                }
            });
        }
    });
}

controller.updateUserInfo = (req, res) => {
    console.log(req.id);
    console.log(req.body);
    const userId = req.id;
    const requestData = req.body;
    let data = {
        name: requestData.name,
        gender: requestData.gender,
        birthdate: new Date(requestData.birthdate),
        picture: requestData.picture,
        country: requestData.country,
        city: requestData.city,
        profession: requestData.profession,
        url: requestData.url,
        description: requestData.description
    }

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            let query = `UPDATE user SET ? WHERE id='${userId}'`;
            conn.query(query, [data], (err, user) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Updated data successfully" });
                }
            });
        }
    });
}

controller.passwordRecovery = (req, res) => {
    const requestData = req.body;
    const email = requestData.email;
    const newPass = Encrypt.encryptPassword(requestData.newPass);

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query(`UPDATE user SET password='${newPass}' WHERE email='${email}'`, (err, user) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Updated password" });
                }
            });
        }
    });
}

controller.verifyUserSN = (req, res) => {
    const requestData = req.body;
    const email = requestData.email;

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query(`SELECT isFacebook, isGoogle FROM user WHERE email='${email}'`, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    if (result == 0)
                        res.status(404).json({ message: "The user doesn't exists" });
                    else
                        res.status(200).json({ socialNetworks: result[0] });
                }
            });
        }
    });
}

controller.verifyUserActive = (req, res) => {
    const requestData = req.body;
    const email = requestData.email;

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query(`SELECT isActive FROM user WHERE email='${email}'`, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    if (result == 0)
                        res.status(404).json({ message: "The user doesn't exists" });
                    else
                        res.status(200).json(result[0]);
                }
            });
        }
    });
}

//Password Recovery v1
/*controller.recoverPassword = (req, res) => {
    console.log(req.body);
    const requestData = req.body;
    const jwt_decoded = jwt.verify(requestData.token, Config.JWT_KEY);
    let newPass = Encrypt.encryptPassword(requestData.newPass);

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query(`UPDATE user SET password='${newPass}' WHERE id='${jwt_decoded.id}'`, (err, user) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Updated password" });
                }
            });
        }
    });
}

controller.sendEmailRecoverPassword = (req, res) => {
    const requestData = req.body;
    const email = requestData.email;

    req.getConnection((err, conn) => {
        if (err) {
            res.status(500).json(err);
        } else {
            conn.query(`SELECT id FROM user WHERE email='${email}'`, (err, user) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    if (user == 0)
                        return res.status(404).json({ message: "The user doesn't exists" });

                    const accessToken = jwt.sign({ id: user[0].id }, Config.JWT_KEY, { expiresIn: 60 * 60 * 24 }, (err, emailToken) => {
                        if (err) {
                            return res.status(500).json({
                                err,
                                message: "Error de validación"
                            })
                        } else {

                            const url = `https://pwd-recovery-test.web.app/?token=${emailToken}`;
                            const mailOptions = {
                                from: 'test@test.co',
                                to: email,
                                subject: 'Restablece tu contraseña',
                                html: `<div style="position: relative; width: 100%;">
                                       <a href="${url}">
                                       <img src="https://backend.test.co/email/pwd-recovery.jpg" alt="" style="width: 100%; height: auto;">
                                       </a>
                                       </div>`
                            };

                            transporter.sendMail(mailOptions, function(err, info) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({
                                        err,
                                        message: "Error al enviar email"
                                    })
                                } else {
                                    console.log(info);
                                    res.status(200).json({ message: "Email sent" });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}*/

module.exports = controller;