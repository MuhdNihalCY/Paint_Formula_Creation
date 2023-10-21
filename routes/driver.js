var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');


const DriverVerifyLogin = (req, res, next) => {
    console.log(req.session.DriverData)
    if (req.session.DriverData) {
        next();
    } else {
        res.redirect('/login');
        // next()
    }
}




router.get('/', DriverVerifyLogin, (req, res, next) => {
    res.render('driver/DriverHome', { DriverLoggedIn: req.session.DriverData })
})

router.get('/logout', DriverVerifyLogin, (req, res) => {
    delete req.session.DriverData;
    delete req.session.DriverData;
    // res.redirect('/login');
    res.redirect('/driver');
})

router.get('/getAllCardsFromDriver', DriverVerifyLogin, async (req, res) => {
    var DirvarName = req.session.DriverData.UserName
    try {
        var Cards = await trelloHelpers.getAllCardsFromDriverSection(DirvarName);
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


router.get('/moveToDoneToday/:cardId', DriverVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoDoneTodayByCardID(cardID).then((response) => {
        res.redirect('/driver')
    })
})

router.get('/CustomerCollection', DriverVerifyLogin, async (req, res) => {
    res.render('driver/CustomerCollection', { DriverLoggedIn: req.session.DriverData })
})


router.get('/getAllCardsFromCustomerCollection', DriverVerifyLogin, async (req, res) => {
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

router.get('/customerCollection/moveToDoneToday/:cardId', DriverVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoDoneTodayByCardID(cardID).then((response) => {
        res.redirect('/driver/CustomerCollection')
    })
})



module.exports = router;