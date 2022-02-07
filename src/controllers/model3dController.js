var sql = require('../dbConection');

const controller = {};

controller.updateModel = (req, res) => {
    const requestData = req.body;
    const data1 = {
        id: requestData.id,
        reference: requestData.reference,
        name: requestData.name,
        description: requestData.description,
        creatorId: requestData.creator,
        price: requestData.price,
        category_id: requestData.categoryId,
        subcategory_id: requestData.subcategoryId
    }
    let data2 = [];
    requestData.formats.forEach(formatId => {
        data2.push([`${data1.id}`, `${formatId}`]);
    });
    let data3 = [];
    requestData.tags.forEach(tagId => {
        data3.push([`${data1.id}`, `${tagId}`]);
    });

    const queries = `UPDATE model3d SET ? WHERE id=${data1.id};
                        DELETE mf FROM model3d_format mf WHERE mf.modelId=${data1.id};
                        DELETE mt FROM model3d_tag mt WHERE mt.model_id=${data1.id};`;
    sql.query(queries, [data1], (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const queries2 = `INSERT INTO model3d_format (modelId, formatId) VALUES ?;
                                INSERT INTO model3d_tag (model_id, tag_id) VALUES ?;`;
            sql.query(queries2, [data2, data3], (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "3D model updated successfully" });
                }
            });
        }
    });
}

controller.getModelById = (req, res) => {
    const requestData = req.body;
    const modelId = requestData.id;

    const query = `SELECT m.id, m.reference, m.name, m.description, u.id as creatorId, m.price, m.category_id, m.subcategory_id, f.id as format, t.id as tag
                    FROM model3d m
                    LEFT JOIN user u ON m.creatorId=u.id
                    LEFT JOIN model3d_format mf ON m.id=mf.modelId
                    LEFT JOIN modelFormat f ON mf.formatId=f.id
                    LEFT JOIN model3d_tag mt ON m.id=mt.model_id
                    LEFT JOIN modelTag t ON mt.tag_id=t.id
                    WHERE m.id='${modelId}'`;
    sql.query(query, async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            console.log(result)
            const modify1 = result.reduce((acc, current) => {
                const found = acc.find(element => element.id === current.id && element.tag === current.tag);

                const value = current.format;
                if (!found) {
                    acc.push({
                        id: current.id,
                        reference: current.reference,
                        name: current.name,
                        description: current.description,
                        creatorId: current.creatorId,
                        price: current.price,
                        categoryId: current.category_id,
                        subcategoryId: current.subcategory_id,
                        formats: [value],
                        tag: current.tag
                    })
                } else {
                    found.formats.push(value)
                }
                return acc;
            }, []);

            const modify2 = modify1.reduce((acc, current) => {
                const found = acc.find(element => element.id === current.id);

                const value = current.tag;
                if (!found) {
                    acc.push({
                        id: current.id,
                        reference: current.reference,
                        name: current.name,
                        description: current.description,
                        creatorId: current.creatorId,
                        price: current.price,
                        categoryId: current.categoryId,
                        subcategoryId: current.subcategoryId,
                        formats: current.formats,
                        tags: [value]
                    })
                } else {
                    found.tags.push(value)
                }
                return acc;
            }, []);
            res.status(200).json({ modelInfo: modify2[0] });
        }
    });
};

controller.list = (req, res) => {
    const query = `SELECT id, reference, name FROM model3d`;
    sql.query(query, async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ models: result });
        }
    });
}

controller.getSavedModels = (req, res) => {
    const userId = req.id;
    let savedModels = [];

    const query = `SELECT m.id
                    FROM model3d m
                    INNER JOIN model3d_favorite mf ON m.id=mf.model3dId
                    WHERE mf.userId=${userId}`;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            result.forEach(element => savedModels.push(element.id));
            res.status(200).json({ savedModels });
        }
    });
}
controller.saveFavorite = (req, res) => {
    const userId = req.id;
    const requestData = req.body;
    const data = {
        model3dId: requestData.modelId,
        userId,
        date: new Date()
    }
    const query = `INSERT INTO model3d_favorite SET ?`;
    sql.query(query, data, (err, result) => {
        if (err) {
            if (err.errno === 1062) { //Si el modelo ya tiene fovorito del usuario
                const query2 = `DELETE FROM model3d_favorite WHERE model3dId=${data.model3dId} and userId=${userId}`;
                sql.query(query2, (err2, result2) => {
                    if (err2) {
                        res.status(500).json(err2);
                    } else {
                        sql.query(`UPDATE model3d SET saved = saved - 1 WHERE id = ${data.model3dId}`, (err, result) => {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({ message: "Favorite deleted successfully" });
                            }
                        })
                    }
                })
            }
        } else {
            sql.query(`UPDATE model3d SET saved = saved + 1 WHERE id = ${data.model3dId}`, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Favorite saved successfully" });
                }
            })
        }
    })
}

controller.getLikedModels = (req, res) => {
    const userId = req.id;
    let likedModels = [];

    const query = `SELECT m.id
                    FROM model3d m
                    INNER JOIN model3d_like ml ON m.id=ml.model3dId
                    WHERE ml.userId=${userId}`;
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            result.forEach(element => likedModels.push(element.id));
            res.status(200).json({ likedModels });
        }
    });
}
controller.saveLike = (req, res) => {
    const userId = req.id;
    const requestData = req.body;
    const data = {
        model3dId: requestData.modelId,
        userId,
        date: new Date()
    }
    const query = `INSERT INTO model3d_like SET ?`;
    sql.query(query, data, (err, result) => {
        if (err) {
            if (err.errno === 1062) { //Si el modelo ya tiene like del usuario
                const query2 = `DELETE FROM model3d_like WHERE model3dId=${data.model3dId} and userId=${userId}`;
                sql.query(query2, (err2, result2) => {
                    if (err2) {
                        res.status(500).json(err2);
                    } else {
                        sql.query(`UPDATE model3d SET likes = likes - 1 WHERE id = ${data.model3dId}`, (err, result) => {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({ message: "Like deleted successfully" });
                            }
                        })
                    }
                })
            }
        } else {
            sql.query(`UPDATE model3d SET likes = likes + 1 WHERE id = ${data.model3dId}`, (err, result) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: "Like saved successfully" });
                }
            })
        }
    })
}

controller.getCompanies = (req, res) => {
    const query = `SELECT u.name 
                    From user u
                    INNER JOIN user_role ur ON u.id=ur.user_id
                    INNER JOIN role r ON ur.role_id=r.id
                    WHERE r.name="Empresa"`;
    let companies = [];
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            result.forEach(element => companies.push(element.name))
            res.status(200).json({ companies });
        }
    });
}

controller.getFormats = (req, res) => {
    const query = 'Select format from modelFormat';
    let formats = [];
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            result.forEach(element => formats.push(element.format))
            res.status(200).json({ formats });
        }
    });
}

controller.getTags = (req, res) => {
    const query = 'Select name from modelTag';
    let tags = [];
    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            result.forEach(element => tags.push(element.name))
            res.status(200).json({ tags });
        }
    });

}

controller.getFavoriteModels = (req, res) => {
    const id = req.id;
    const query = `SELECT m.id, m.name, u.name as creator, m.imagePath1, m.price, f.format, t.name as tag
                    FROM model3d m
                    LEFT JOIN user u ON m.creatorId=u.id
                    LEFT JOIN model3d_format mf ON m.id=mf.modelId
                    LEFT JOIN modelFormat f ON mf.formatId=f.id
                    LEFT JOIN model3d_tag mt ON m.id=mt.model_id
                    LEFT JOIN modelTag t ON mt.tag_id=t.id
                    WHERE m.id IN (SELECT m.id
                                    FROM model3d m
                                    LEFT JOIN model3d_favorite mfav ON m.id=mfav.model3dId
                                    LEFT JOIN user u ON u.id=mfav.userId                    
                                    WHERE u.id=${id});`;


    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const modify1 = result.reduce((acc, current) => {
                const found = acc.find(element => element.id === current.id && element.tag === current.tag);

                const value = current.format;
                if (!found) {
                    acc.push({
                        id: current.id,
                        name: current.name,
                        creator: current.creator,
                        imagePath1: current.imagePath1,
                        price: current.price,
                        formats: [value],
                        tag: current.tag
                    })
                } else {
                    found.formats.push(value)
                }
                return acc;
            }, []);

            const modify2 = modify1.reduce((acc, current) => {
                const found = acc.find(element => element.id === current.id);

                const value = current.tag;
                if (!found) {
                    acc.push({
                        id: current.id,
                        name: current.name,
                        creator: current.creator,
                        imagePath1: current.imagePath1,
                        price: current.price,
                        formats: current.formats,
                        tags: [value]
                    })
                } else {
                    found.tags.push(value)
                }
                return acc;
            }, []);
            res.status(200).json({ models: modify2 });
        }
    });
}

controller.getModelsBySubcategoryId = (req, res) => {
    const requestData = req.body;
    const categoryId = requestData.categoryId;
    /*const query = `SELECT m.id, m.name, u.name as creator, m.imagePath1, m.price
                    FROM model3d m
                    INNER JOIN user u ON m.creatorId=u.id
                    WHERE m.subcategory_id='${categoryId}'`;*/
    const query = `SELECT m.id, m.name, u.name as creator, m.imagePath1, m.price, f.format, t.name as tag
                    FROM model3d m
                    INNER JOIN user u ON m.creatorId=u.id
                    LEFT JOIN model3d_format mf ON m.id=mf.modelId
                    LEFT JOIN modelFormat f ON mf.formatId=f.id
                    LEFT JOIN model3d_tag mt ON m.id=mt.model_id
                    LEFT JOIN modelTag t ON mt.tag_id=t.id
                    WHERE m.subcategory_id='${categoryId}'`;


    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const modify1 = result.reduce((acc, current) => {
                const found = acc.find(element => element.id === current.id && element.tag === current.tag);

                const value = current.format;
                if (!found) {
                    acc.push({
                        id: current.id,
                        name: current.name,
                        creator: current.creator,
                        imagePath1: current.imagePath1,
                        price: current.price,
                        formats: [value],
                        tag: current.tag
                    })
                } else {
                    found.formats.push(value)
                }
                return acc;
            }, []);

            const modify2 = modify1.reduce((acc, current) => {
                const found = acc.find(element => element.id === current.id);

                const value = current.tag;
                if (!found) {
                    acc.push({
                        id: current.id,
                        name: current.name,
                        creator: current.creator,
                        imagePath1: current.imagePath1,
                        price: current.price,
                        formats: current.formats,
                        tags: [value]
                    })
                } else {
                    found.tags.push(value)
                }
                return acc;
            }, []);
            res.status(200).json({ models: modify2 });
        }
    });
}

controller.getModelInfo = (req, res) => {
    const requestData = req.body;
    const id = requestData.index;

    const query = `SELECT m.id, m.name, m.description, m.sketchfabCode, m.imagePath1,
                    m.imagePath2, m.imagePath3, m.price, m.likes, m.saved, m.shared,
                    u.name as creator, u.description as companyDescription 
                    FROM model3d m
                    INNER JOIN user u ON m.creatorId=u.id
                    WHERE m.id=${id}`;
    const query2 = `; SELECT f.format
                    FROM model3d m, model3d_format mf, modelFormat f 
                    WHERE m.id=${id} and m.id=mf.modelId and mf.formatId=f.id`;
    const query3 = `; SELECT t.name 
                    FROM model3d m, model3d_tag mt, modelTag t 
                    WHERE m.id=${id} and m.id=mt.model_id and mt.tag_id=t.id`;

    sql.query(query + query2 + query3, (err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({
                modelInfo: results[0],
                formats: results[1],
                tags: results[2]
            });
        }
    });
}

controller.getModelTags = (req, res) => {
    const query = "SELECT * From modelTag";

    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ tags: result });
        }
    })
}

controller.getModelFormats = (req, res) => {
    const query = "SELECT * From modelFormat";

    sql.query(query, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ formats: result });
        }
    })
}

controller.addModel = (req, res) => {
    const requestData = req.body;
    const id = req.id;
    let data1 = {
        reference: requestData.reference,
        name: requestData.name,
        description: requestData.description,
        creatorId: requestData.creatorId,
        sketchfabCode: requestData.sketchfabCode,
        modelPath: requestData.modelPath,
        colliderPath: requestData.colliderPath,
        shadowPath: requestData.shadowPath,
        textureAPath: requestData.textureAPath,
        textureBCPath: requestData.textureBCPath,
        textureNPath: requestData.textureNPath,
        textureRPath: requestData.textureRPath,
        zipPath: requestData.zipPath,
        sketchfabCode: requestData.sketchfabCode,
        imagePath1: requestData.image1Path,
        imagePath2: requestData.image2Path,
        imagePath3: requestData.image3Path,
        price: requestData.price,
        category_id: requestData.category_id,
        subcategory_id: requestData.subcategory_id,
        addedBy: id,
        dateOfAdition: new Date()
    }
    const tagsIds = requestData.tagsIds;
    const formatIds = requestData.formatIds;
    console.log(formatIds);

    const query1 = 'INSERT INTO model3d SET ?; SELECT LAST_INSERT_ID();';
    sql.query(query1, [data1, null], async(err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const modelId = results[1][0]['LAST_INSERT_ID()'];
            // Para agregar los tags
            let data2 = [];
            tagsIds.forEach(tagId => {
                data2.push([`${modelId}`, `${tagId}`]);
            });
            const query2 = `INSERT INTO model3d_tag (model_id, tag_id) VALUES ?`;
            let p1 = new Promise((resolve, reject) => {
                sql.query(query2, [data2], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            });
            // Para agregar los formatos
            let data3 = [];
            formatIds.forEach(formatId => {
                data3.push([`${modelId}`, `${formatId}`]);
            });
            const query3 = `INSERT INTO model3d_format (modelId, formatId) VALUES ?`;
            let p2 = new Promise((resolve, reject) => {
                sql.query(query3, [data3], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            });

            await Promise.all([p1, p2]).then(values => {
                //console.log(values);
                res.status(200).json({ message: "3D model info added successfully" });
            }).catch(reason => {
                //console.log(reason);
                res.status(500).json(reason);
            });
        }
    })
}

module.exports = controller;