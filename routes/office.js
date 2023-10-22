var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');


const OfficeVerifyLogin = (req, res, next) => {
    console.log(req.session.OfficeData)
    if (req.session.OfficeData) {
        next();
    } else {
        res.redirect('/login');
        // next()
    }
}




router.get('/', OfficeVerifyLogin, (req, res, next) => {
    res.render('office/Officehome', { OfficeLogged: req.session.OfficeData });
})

router.get('/logout', OfficeVerifyLogin, (req, res) => {
    delete req.session.OfficeData;
    delete req.session.OfficeLogged;
    // res.redirect('/login');
    res.redirect('/Office');
})


router.get('/getAllCardsFromOfficeSection', OfficeVerifyLogin, async (req, res) => {
    try {
        var Cards = await trelloHelpers.getAllCardsFromOfficeSection();
        Cards = await trelloHelpers.addImageToCardsInArray(Cards)
        console.log(Cards);


        const allCardDataPromises = Cards.map(async (card) => {
            const cardChecklistIDArray = card.idChecklists;
            console.log("cardChecklistIDArray: ", cardChecklistIDArray[0]);
            const checkItems = await trelloHelpers.getChecklistFromCheckListID(cardChecklistIDArray[0]);
            card.checkItems = checkItems;
            console.log("Check Items: ", checkItems);
            const ContactDetails = await employeeHelpers.getCardContactDetails(card.id);
            card.ContactDetails = ContactDetails;
            console.log("ContactDetails: ", ContactDetails);
            const ProductionPeopole = await employeeHelpers.getAllProductionPeople();
            console.log("Production Peoplae: ", ProductionPeopole);
            card.ProductionPeople = ProductionPeopole
            return card;
        });

        const AllCards = await Promise.all(allCardDataPromises);


        res.json({ AllCards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/moveCardtoReadyToDispatch/:cardId', OfficeVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoReadyToDispatchByCardID(cardID).then((response) => {
        res.redirect('/Office')
    })
})

router.post('/cardUpdated/:cardID', OfficeVerifyLogin, (req, res) => {
    var CardID = req.params.cardID;
    // console.log(req.body);
    var ProductionPerson = req.body.selectProductionPeople;
    if (ProductionPerson) {
        trelloHelpers.moveCardToProduction(CardID, ProductionPerson).then((response) => {
            res.redirect('/Office')
        })
    } else {
        res.redirect('/Office', { Error: "No Production person is selected" })
    }
})

router.get('/Printlabel/:CardID', OfficeVerifyLogin, async (req, res) => {
    let cardID = req.params.CardID;

    try {
        var InsertedTime = await employeeHelpers.getOrderIDByCardId(cardID);
        console.log('Inserted Time: ', InsertedTime);

        res.redirect(`/printlabel/${InsertedTime}`);
    } catch (error) {
        console.error('Error getting InsertedTime:', error);
        // Handle the error here or provide an appropriate response to the client.
    }

})




router.get('/moveToDoneToday/:cardId', OfficeVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoDoneTodayByCardID(cardID).then((response) => {
        res.redirect('/office/CustomerCollection')
    })
})

router.get('/CustomerCollection', OfficeVerifyLogin, async (req, res) => {
    res.render('office/CustomerCollection', { OfficeLogged: req.session.OfficeData })
})


router.get('/getAllCardsFromCustomerCollection', OfficeVerifyLogin, async (req, res) => {
    try {
        var Cards = await trelloHelpers.getAllCardsFromCustomerCollectionSection();
        Cards = await trelloHelpers.addImageToCardsInArray(Cards)
        console.log(Cards);


        const allCardDataPromises = Cards.map(async (card) => {
            if (card.idChecklists.length > 0) {
                const cardChecklistIDArray = card.idChecklists;
                console.log("cardChecklistIDArray: ", cardChecklistIDArray[0]);
                const checkItems = await trelloHelpers.getChecklistFromCheckListID(cardChecklistIDArray[0]);
                card.checkItems = checkItems;
                console.log("Check Items: ", checkItems);
            }
            const ContactDetails = await employeeHelpers.getCardContactDetails(card.id);
            card.ContactDetails = ContactDetails;
            console.log("ContactDetails: ", ContactDetails);
            const Driver = await employeeHelpers.getAllDriverPeople();
            console.log("Driver Peoplae: ", Driver);
            card.Driver = Driver
            return card;
        });

        const AllCards = await Promise.all(allCardDataPromises);


        res.json({ AllCards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.get('/getAllCardsFromBoard', OfficeVerifyLogin, (req, res) => {
    trelloHelpers.getAllCardsFromBoard().then((Cards) => {
        // console.table(Cards);
        trelloHelpers.addImageToCardsInArray(Cards).then((AllCard) => {
            trelloHelpers.AddListToCards(AllCard).then((AllCards)=>{
                // console.log(AllCards);
                res.json({ AllCards });
            })
        })
    })
})








module.exports = router;