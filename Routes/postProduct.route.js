const express = require("express");
const app = express()
const postProduct = express.Router();
const axios = require('axios');
const fs = require('fs');
var databasePath = 'db.json'
// *****************Add Product***************

postProduct.post("/api/product", async (req, res) => {
    const payload = req.body
    // console.log(payload)
    try {
        axios({
            method: 'GET',
            url: payload.product_images,
            responseType: 'stream'
        })
            .then((response) => {
                const writer = fs.createWriteStream(`./Public/${payload.productName}.jpg`);
                response.data.pipe(writer);
                writer.on('finish', async () => {
                    fs.readFile(databasePath, 'utf8', (err, data) => {
                        if (err) {
                            res.status(404).send({ "msg": "Error while reading database", "error": err });
                        } else {
                            const Alldata = JSON.parse(data);
                            const newItem = req.body;
                            Alldata.push(newItem);
                            fs.writeFile(databasePath, JSON.stringify(Alldata), (err) => {
                                if (err) {
                                    res.status(404).send({ "msg": "Error while posting data into database", "error": err });
                                } else {
                                    res.status(200).send({ "msg": "Product Added" });
                                }
                            });
                        }
                    });


                });

                // Handle any errors during the download
                writer.on('error', (err) => {

                    res.status(404).send({ "msg": "Error while downloading image", "error": err });
                });
            })
            .catch((err) => {

                res.status(404).send({ "msg": "Error downloading image", "error": err });
            });




    } catch (err) {
        console.log(err)
        res.status(404).send({
            "msg": "Product Added failed",
            "error": err
        })
    }

});

// ******Product by its ProductID****

postProduct.get("/api/product/:id", async (req, res) => {
    const productId = req.params.id;
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send({ "msg": "Error while reading database", "error": err });
        } else {
            var Alldata = JSON.parse(data);
            Alldata = Alldata.filter((item) => item.productId == productId);
            if (Alldata.length > 0) {
                res.status(200).send(Alldata)
            } else {
                res.status(404).send('productID not found')

            }
        }
    });


});

//active product  example==>  /api/product?page=2&limit=5;
postProduct.get("/api/product", async (req, res) => {
    var limit = req.query.limit || 10
    var page = req.query.page || 1
    const skip = (page - 1) * limit;
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send({ "msg": "Error while reading database", "error": err });
        } else {
            var Alldata = JSON.parse(data);
            Alldata = Alldata.filter((item, index) => {
                return index < 10 && item.isActive == true
            });

            if (Alldata.length > 0) {
                res.status(200).send(Alldata)
            } else {
                res.status(404).send('No products found')

            }
        }
    });
})


//Edit product by productID

postProduct.put("/api/product/:id", async (req, res) => {
    var productId = req.params.id;
    var payload = req.body
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send({ "msg": "Error while reading database", "error": err });
        } else {
            var Alldata = JSON.parse(data);
            Alldata = Alldata.map((item) => {
                if (item.productId == productId) {
                    return payload
                } else {
                    return item
                }
            });

            fs.writeFile(databasePath, JSON.stringify(Alldata), (err) => {
                if (err) {
                    res.status(404).send({ "msg": "Error updating product", "error": err });
                } else {
                    res.status(200).send({ "msg": "Product updated" });
                }
            });
        }
    });


})

//Delete product by productID

postProduct.delete("/api/product/:id", async (req, res) => {
    var productId = req.params.id;
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send({ "msg": "Error while reading database", "error": err });
        } else {
            var Alldata = JSON.parse(data);
            var Alldata = Alldata.filter((item) => {
                if (item.productId !== productId) {
                    return item
                }
            });
            fs.writeFile(databasePath, JSON.stringify(Alldata), (err) => {
                if (err) {
                    res.status(404).send({ "msg": "Error deleting product", "error": err });
                } else {
                    res.status(200).send({ "msg": "Product deleted" });
                }
            });
        }
    });


})


module.exports = { postProduct }