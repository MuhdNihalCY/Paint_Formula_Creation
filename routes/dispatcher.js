var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');


const DispatcherVerifyLogin = (req, res, next) => {
    console.log(req.session.DispatcherData)
    if (req.session.DispatcherData) {
        next();
    } else {
        res.redirect('/login');
        // next()
    }
}



router.get('/', DispatcherVerifyLogin, (req, res, next) => {
    res.render('dispatcher/DispatcherHome', { DispatcherLoggedIn: req.session.DispatcherData })
})

router.get('/logout', DispatcherVerifyLogin, (req, res) => {
    delete req.session.DispatcherData;
    delete req.session.DispatcherData;
    // res.redirect('/login');
    res.redirect('/dispatcher');
})

router.get('/getAllCardsFromDispatcherSection', DispatcherVerifyLogin, async (req, res) => {
    try {
        var Cards = await trelloHelpers.getAllCardsFromDispatcherSection();
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


router.get('/moveToCustomerCollection/:cardID', DispatcherVerifyLogin, (req, res) => {
    var cardID = req.params.cardID;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoCustomerCollectionByCardID(cardID).then((response) => {
        res.redirect('/dispatcher')
    })
})

router.post('/cardUpdated/:CardID', DispatcherVerifyLogin, (req, res) => {
    var CardID = req.params.CardID;
    // console.log(req.body);
    var Driver = req.body.Driver;
    if (Driver) {
        trelloHelpers.moveCardToDriver(CardID, Driver).then((response) => {
            res.redirect('/dispatcher')
        })
    } else {
        res.redirect('/dispatcher', { Error: "No Production person is selected" })
    }
})


router.get('/CustomerCollection', DispatcherVerifyLogin, async (req, res) => {
    res.render('dispatcher/CustomerCollection', { DispatcherLoggedIn: req.session.DispatcherData })
})


router.get('/getAllCardsFromCustomerCollection', DispatcherVerifyLogin, async (req, res) => {
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


router.get('/moveToDoneToday/:cardId', DispatcherVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoDoneTodayByCardID(cardID).then((response) => {
        res.redirect('/dispatcher/CustomerCollection')
    })
})


router.get('/getAllCardsFromBoard', DispatcherVerifyLogin, (req, res) => {
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