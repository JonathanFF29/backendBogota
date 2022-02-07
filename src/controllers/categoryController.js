var sql = require('../dbConection');

const controller = {};

controller.getCategories = (req, res) => {
    const query = `SELECT c.id AS categoryId, c.name AS categoryName, c.imagePath, c.colorlessImagePath, sc.id AS subcategoryId, sc.name AS subcategoryName
                    FROM category c
                    LEFT JOIN subcategory sc ON c.id=sc.category_id`;
    sql.query(query, async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            let categories = [];

            result.forEach(element => {
                // Compruebo si ya existe el elemento
                let exists = categories.find(x => x.id === element.categoryId);
                // Si no existe lo creo con un array vacío en VALOR
                if (!exists) {
                    exists = {
                        id: element.categoryId,
                        name: element.categoryName,
                        imagePath: element.imagePath,
                        colorlessImagePath: element.colorlessImagePath,
                        subcategories: []
                    };
                    categories.push(exists);
                }

                if (element.subcategoryId != null) {
                    let subcategory = {
                        id: element.subcategoryId,
                        name: element.subcategoryName
                    }
                    exists.subcategories.push(subcategory);
                }
            });

            res.status(200).json({ categories });
        }
    });
}

controller.addCategory = (req, res) => {
    const requestData = req.body;
    const data = {
        name: requestData.name,
        imagePath: requestData.imagePath
    }

    const query = 'INSERT INTO category SET ?';
    sql.query(query, [data], async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ message: "Category added successfully" });
        }
    })
}

controller.addSubCategory = (req, res) => {
    const requestData = req.body;
    const data = {
        name: requestData.name,
        category_id: requestData.category_id,
        imagePath: requestData.imagePath
    }

    const query = 'INSERT INTO subcategory SET ?';
    sql.query(query, [data], async(err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json({ message: "Subcategory added successfully" });
        }
    })
}

module.exports = controller;