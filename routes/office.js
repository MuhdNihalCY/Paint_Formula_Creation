var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');
const whatsappHelper = require('../helpers/whatsappHelper');


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
    // res.render('office/Officehome', { OfficeLogged: req.session.OfficeData });
    res.redirect('/office/home');
})

router.get('/logout', OfficeVerifyLogin, (req, res) => {
    delete req.session.OfficeData;
    delete req.session.OfficeLogged;
    // res.redirect('/login');
    res.redirect('/Office');
})


router.get('/getAllCardsFromOfficeSection', OfficeVerifyLogin, async (req, res) => {

    employeeHelpers.GetAllCardsByListName("OFFICE SECTION").then(async (AllCards) => {
        const ProductionPeopole = await employeeHelpers.getAllProductionPeople();
        //         console.log("Production Peoplae: ", ProductionPeopole);

        AllCards.forEach(card => {
            card.ProductionPeople = ProductionPeopole
        });
        console.log("OfficesectionCards", AllCards);
        res.json({ AllCards });
    })
    // try {
    //     var Cards = await trelloHelpers.getAllCardsFromOfficeSection();
    //     Cards = await trelloHelpers.addImageToCardsInArray(Cards)
    //     console.log(Cards);


    //     const allCardDataPromises = Cards.map(async (card) => {
    //         const cardChecklistIDArray = card.idChecklists;
    //         console.log("cardChecklistIDArray: ", cardChecklistIDArray[0]);
    //         const checkItems = await trelloHelpers.getChecklistFromCheckListID(cardChecklistIDArray[0]);
    //         card.checkItems = checkItems;
    //         console.log("Check Items: ", checkItems);
    //         const ContactDetails = await employeeHelpers.getCardContactDetails(card.id);
    //         card.ContactDetails = ContactDetails;
    //         console.log("ContactDetails: ", ContactDetails);
    //         const ProductionPeopole = await employeeHelpers.getAllProductionPeople();
    //         console.log("Production Peoplae: ", ProductionPeopole);
    //         card.ProductionPeople = ProductionPeopole
    //         return card;
    //     });

    //     const AllCards = await Promise.all(allCardDataPromises);


    //     res.json({ AllCards });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: 'Internal Server Error' });
    // }
});

router.get('/moveCardtoReadyToDispatch/:cardId', OfficeVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);

    employeeHelpers.getCardByID(req.params.cardId).then((Card) => {
        Card.CurrentList = "FOR DISPATCH";
        var OldListArray = Card.ListArray[0];
        OldListArray.OutTime = Date.now();
        OldListArray.OutEmployeeName = req.session.OfficeData.UserName;
        OldListArray.OutEmployeeDesignation = req.session.OfficeData.Designation;

        var NewListArray = {
            ListName: "FOR DISPATCH",
            InTime: Date.now(),
            InEmployeeName: req.session.OfficeData.UserName,
            InEmployeeDesignation: req.session.OfficeData.Designation
        }

        Card.ListArray.unshift(NewListArray);

        employeeHelpers.CreateForDispatchListIfNot().then(() => {
            employeeHelpers.SaveUpdatedCardBy(Card, Card._id.toString()).then(() => {
                res.redirect('/Office')
            });
        })
    })
    // trelloHelpers.moveCardtoReadyToDispatchByCardID(cardID).then((response) => {
    //     res.redirect('/Office')
    // })
})

router.post('/cardUpdated/:cardID', OfficeVerifyLogin, (req, res) => {
    var CardID = req.params.cardID;
    // console.log(req.body);
    var ProductionPerson = req.body.selectProductionPeople; 
    if (ProductionPerson) {
        employeeHelpers.getCardByID(CardID).then((Card) => {
            // 
            Card.CurrentList = ProductionPerson;
            Card.ProductionPerson = ProductionPerson;

            var OldListArray = Card.ListArray[0];
            OldListArray.OutTime = Date.now();
            OldListArray.OutEmployeeName = req.session.OfficeData.UserName;
            OldListArray.OutEmployeeDesignation = req.session.OfficeData.Designation;

            var NewListArray = {
                ListName: ProductionPerson,
                InTime: Date.now(),
                InEmployeeName: req.session.OfficeData.UserName,
                InEmployeeDesignation: req.session.OfficeData.Designation
            }

            Card.ListArray.unshift(NewListArray);

            employeeHelpers.SaveUpdatedCardBy(Card, CardID).then(() => {
                res.redirect('/Office');
            })

        })
        // trelloHelpers.moveCardToProduction(CardID, ProductionPerson).then((response) => {
        //     res.redirect('/Office')
        // })
    } else {
        res.redirect('/Office', { Error: "No Production person is selected" })
    }
})

router.get('/Printlabel/:FileNo', OfficeVerifyLogin, async (req, res) => {
    let FileNo = req.params.FileNo;

    try {

        var InsertedTime = await employeeHelpers.getBulkOrderInsertedTime(FileNo);
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
    employeeHelpers.GetAllCards().then((AllCards) => {
        console.log("Global cards: ", AllCards);
        res.json({ AllCards });
    })
})

router.get('/api/OrderDeliver/whatsapp/:cardID/:DeliveryLocation', OfficeVerifyLogin, (req, res) => {
    var cardID = req.params.cardID;
    var DeliveryLocation = req.params.DeliveryLocation;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoDoneTodayByCardID(cardID).then((response) => {
        trelloHelpers.getCardByID(cardID).then(async (Card) => {
            if (Card.idChecklists.length > 0) {
                const cardChecklistIDArray = Card.idChecklists;
                console.log("cardChecklistIDArray: ", cardChecklistIDArray[0]);
                const checkItems = await trelloHelpers.getChecklistFromCheckListID(cardChecklistIDArray[0]);
                Card.checkItems = checkItems;
                console.log("Check Items: ", checkItems);
            }
            const ContactDetails = await employeeHelpers.getCardContactDetails(Card.id);
            Card.ContactDetails = ContactDetails;
            console.log("ContactDetails: ", ContactDetails);
            console.log("Card: ", Card);
            whatsappHelper.sendDeliveyMessage(Card, DeliveryLocation).then(() => {
                res.redirect('/office/CustomerCollection')
            })
        })
    }) 
})

router.get('/home', OfficeVerifyLogin, (req, res) => {
    res.render('office/OfficeCustomTrello', { OfficeLogged: req.session.OfficeData });
});









module.exports = router;