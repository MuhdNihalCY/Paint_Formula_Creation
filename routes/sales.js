var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');

const SalesVerifyLogin = (req, res, next) => {
    if (req.session.SalesData) {
        next();
    } else {
        res.redirect('/login');
        // next()
    }
}

router.get('/', SalesVerifyLogin, (req, res, next) => {
    res.render('sales/home', { SalesLogged: req.session.SalesData });
})

router.get('/logout', SalesVerifyLogin, (req, res) => {
    delete req.session.SalesData;
    delete req.session.SalesLogged;
    // res.redirect('/login');
    res.redirect('/sales');
})

router.get('/getAllCardsFromOrders', SalesVerifyLogin, (req, res) => {
    trelloHelpers.getAllCardsFromOrders().then((Cards) => {
        // console.table(Cards);
        trelloHelpers.addImageToCardsInArray(Cards).then((AllCards) => {
            // console.log(AllCards);
            res.json({ AllCards });
        })
    })
})

router.post('/cardUpdated/:CardId', SalesVerifyLogin, (req, res) => {
    // console.log(req.body);
    var Card = req.body;
    Card.id = req.params.CardId
    console.log(Card);
    trelloHelpers.getCardByID(Card.id).then((CardData) => {
        // console.log("CardData: ", CardData);
        trelloHelpers.UpdateCardNameandDescriptionAndMoveToOffice(Card, CardData).then((updatedCard) => {
            // console.log("updatedCard: ", updatedCard);
            trelloHelpers.createNewChecklistAndItems(Card).then((response) => {
                // console.log("CheckList Added: respose: ",response);
                employeeHelpers.StoreModifiedCardBySales(Card).then(() => {
                    res.redirect('/sales');
                })
            })
        })

    })
})

module.exports = router;