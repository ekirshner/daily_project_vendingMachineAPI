const express = require('express');
const Sequelize = require('sequelize');
const bodyparser = require('body-parser');

const server = express();

//Bodyparser
server.use(bodyparser.urlencoded({ extended: false }));


//Set up Database and Schemas
const db = new Sequelize('vendingMachineDb', 'Erica', '', {
    dialect: 'postgres',
});
//////////////////////////  ITEM SCHEMA ///////////////////////////
const Item = db.define('items', {
    name: Sequelize.STRING,
    price: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
});

// Item.sync().then(function () {
//     console.log('model synched!')

//     Item.create({
//         name: 'Candy Bar',
//         price: '75',
//         quantity: '2',
//     });
//     console.log('item1 saved')
//     Item.create({
//         name: 'Potato Chips',
//         price: '65',
//         quantity: '3',
//     });
//     console.log('item2 saved')
//     Item.create({
//         name: 'Fruit',
//         price: '50',
//         quantity: '5',
//     });
//     console.log('item3 saved')
//     Item.create({
//         name: 'Granola',
//         price: '75',
//         quantity: '1',
//     });
//     console.log('item4 saved')
//     Item.create({
//         name: 'Cupcake',
//         price: '100',
//         quantity: '4',
//     });
//     console.log('item5 saved')
// });

//////////////////////////  PURCHASE SCHEMA ///////////////////////////
const Purchase = db.define('purchases', {
    name: Sequelize.STRING,
    pricePaid: Sequelize.INTEGER,
});

Purchase.belongsTo(Item);

Purchase.sync().then(function () {
    console.log('model synched!')
});
////////////////////////////////////////////////////////////////////////



//Get a list of items
server.get('/api/customer/items', function (req, res) {
    Item.findAll()
        .then(function (results) {
            res.json({
                status: 'success',
                data: results
            });
        });
});

//Purchase an Item
server.post('/api/customer/items/:itemId/purchases', function (req, res) {
    let change;
    Item.findById(parseInt(req.params.itemId))
        .then(function (result) {
            if (result.quantity > 0 && req.body.formInput > result.price) {
                Item.update({
                    quantity: result.quantity - 1,
                }, { where: { id: req.params.itemId } }
                );
                Purchase.create({
                    name: result.name,
                    pricePaid: result.price,
                    itemId: result.id,
                });
                change = req.body.formInput - result.price;
                res.json({
                    status: 'success',
                    change: change
                });
            } else {
                res.send('There was an error with your purchase');
            };
        });

});

//Get a list of all purchases with their item and date/time
server.get('/api/vendor/purchases', function (req, res) {
    Purchase.findAll()
        .then(function (results) {
            res.json({
                status: 'success',
                data: results
            });
        });
});

//Get a total amount of money accepted by the machine
server.get('/api/vendor/money', function (req, res) {
    Purchase.sum('pricePaid')
        .then(function (total) {
            res.json({
                status: 'success',
                total: total
            });
        });

});

//Add a new item not previously existing in the machine
server.post('/api/vendor/items', function (req, res) {
    Item.create({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
    })
        .then(function (results) {
            res.json({
                status: 'success',
                data: results
            });
        });
});

//Update item quantity, description, and cost
server.put('/api/vendor/items/:itemId', function (req, res) {

    Item.update({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
    }, { where: { id: req.params.itemId } }
    )
        .then(function (data) {
            res.json({
                status: 'success',
                data: results
            });
        });
});

//Server
server.listen(3000, function () {
    console.log('running!')
});