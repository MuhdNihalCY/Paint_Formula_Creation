var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');
const whatsappHelper = require('../helpers/whatsappHelper');


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
    res.redirect('/dispatcher/home');
    // res.render('dispatcher/DispatcherHome', { DispatcherLoggedIn: req.session.DispatcherData })
})

router.get('/logout', DispatcherVerifyLogin, (req, res) => {
    delete req.session.DispatcherData;
    delete req.session.DispatcherData;
    // res.redirect('/login');
    res.redirect('/dispatcher');
})

router.get('/getAllCardsFromDispatcherSection', DispatcherVerifyLogin, async (req, res) => {
    employeeHelpers.GetAllCardsByListName("FOR DISPATCH").then(async (AllCards) => {

        const Driver = await employeeHelpers.getAllDriverPeople();
        AllCards.forEach(async (card) => {
            console.log("Driver Peoplae: ", Driver);
            card.Driver = Driver
        })

        console.log("FOR DISPATCH sectionCards", AllCards);
        res.json({ AllCards });
    })
})


router.get('/moveToCustomerCollection/:cardID', DispatcherVerifyLogin, (req, res) => {
    var cardID = req.params.cardID;
    console.log("cardID: ", cardID);

    employeeHelpers.moveCardToCustomerCollectionByCardIDAndMovedUser(cardID, req.session.DispatcherData).then(() => {
        res.redirect('/dispatcher/CustomerCollection');
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
    employeeHelpers.GetAllCards().then((AllCards) => {
        console.log("Global cards: ", AllCards);
        res.json({ AllCards });
    })
})


router.get('/api/OrderDeliver/whatsapp/:cardID/:DeliveryLocation', DispatcherVerifyLogin, (req, res) => {

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

                res.redirect('/dispatcher/CustomerCollection')
            })

        })

    })
})

router.get('/home', DispatcherVerifyLogin, (req, res) => {
    res.render('dispatcher/DispatcherHome', { DispatcherLoggedIn: req.session.DispatcherData });
});


router.get('/getAllCardAndListsAndUsersToManagement', (req, res) => {
    var BranchName = req.session.DispatcherData.Branch;

    // Define an array of promise-producing functions
    const promiseFunctions = [
        employeeHelpers.GetAllCards(BranchName),
        employeeHelpers.getAllLists(BranchName),
        employeeHelpers.getAllUsers(BranchName),
        employeeHelpers.getAllCustomers(BranchName),
        employeeHelpers.GetAllFormulations(),
        employeeHelpers.getAllLabels(BranchName),
    ];

    // Execute all promises concurrently using Promise.all
    Promise.all(promiseFunctions)
        .then(([AllCards, AllLists, AllUsers, AllCustomers, Formulas, AllLabels]) => {
            console.log("AllCards.length: ", AllCards.length);
            console.log("AllLists.length: ", AllLists.length);
            console.log("AllUsers.length:", AllUsers.length);
            console.log("AllCustomers.length:", AllCustomers.length);
            console.log("Formulas.length:", Formulas.length);

            // Now that you have Formulas, call the next function
            return employeeHelpers.getAllMeasuringUnitOfAllFormulas(Formulas)
                .then((UpdatedFromuls) => {
                    console.log("UpdatedFromuls.length: ", UpdatedFromuls.length);

                    var data = {
                        AllCards: AllCards,
                        AllLists: AllLists,
                        AllUsers: AllUsers,
                        Customers: AllCustomers,
                        Formulas: UpdatedFromuls,
                        Labels: AllLabels
                    };

                    res.json(data);
                });
        })
        .catch(error => {
            // Handle errors here
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });


    // var BranchName = req.session.DispatcherData.Branch;
    // employeeHelpers.GetAllCards(BranchName).then((AllCards) => {
    //     console.log("AllCards.length: ", AllCards.length);
    //     employeeHelpers.getAllLists(BranchName).then((AllLists) => {
    //         console.log("AllLists.length: ", AllLists.length);
    //         employeeHelpers.getAllUsers(BranchName).then((AllUsers) => {
    //             console.log("AllUsers.length:", AllUsers.length);
    //             employeeHelpers.getAllCustomers(BranchName).then((AllCustomers) => {
    //                 console.log("AllCustomers.length:", AllCustomers.length);
    //                 employeeHelpers.GetAllFormulations().then((Formulas) => {
    //                     console.log("Formulas.length:", Formulas.length);
    //                     employeeHelpers.getAllMeasuringUnitOfAllFormulas(Formulas).then((UpdatedFromuls) => {
    //                         console.log("UpdatedFromuls.length: ", UpdatedFromuls.length);
    //                         employeeHelpers.getAllLabels(BranchName).then((AllLabels) => {
    //                             console.log("AllLabels.length:", AllLabels.length);

    //                             // console.log("Formulas = ", Formulas[2]);

    //                             var data = {
    //                                 AllCards: AllCards,
    //                                 AllLists: AllLists,
    //                                 AllUsers: AllUsers,
    //                                 Customers: AllCustomers,
    //                                 Formulas: UpdatedFromuls,
    //                                 Labels: AllLabels
    //                             }
    //                             res.json(data);
    //                         })
    //                     })
    //                 })

    //             })
    //         })
    //     })
    // })
})

router.get('/ChangeListofCard/:CardID/:NewListName/:Designation', DispatcherVerifyLogin, (req, res) => {
    let cardID = req.params.CardID;
    let newlistname = req.params.NewListName;
    let Designation = req.params.Designation;

    var UserNow = req.session.DispatcherData;

    var Data = {
        cardID: cardID,
        newlistname: newlistname,
        UserName: UserNow.UserName,
        Designation: UserNow.Designation,
        Activity: {
            activity: `${UserNow.UserName} Moved card to ${newlistname}.`,
            Time: Date.now(),
        }
    }

    if (Designation === "Production") {
        Data.ProductionPerson = newlistname;
    }
    employeeHelpers.ChangeCardList(Data).then(() => {
        res.json({ Status: true });
    })
})

router.get('/ChangeListofCardName/:CardName/:DropColumeName/:Designation', DispatcherVerifyLogin, (req, res) => {
    let CardName = req.params.CardName;
    let DropColumeName = req.params.DropColumeName;
    let Designation = req.params.Designation;
    var UserNow = req.session.DispatcherData;
    var NewActivity = UserNow.UserName + " Moved card to " + DropColumeName + ".";
    console.log("/ChangeListofCardName/:CardName/:DropColumeName/:Designation");
    var Data = {
        CardName: CardName,
        newlistname: DropColumeName,
        UserName: UserNow.UserName,
        Designation: UserNow.Designation,
        Activity: {
            activity: NewActivity,
            Time: Date.now(),
        }
    }
    if (Designation === "Production") {
        Data.ProductionPerson = DropColumeName;
    }
    employeeHelpers.ChangeCardListByName(Data).then((data) => {
        //console.log(data);
        res.json({ Status: true });
    })
})

router.get('/CreateNewLabel/:Color/:ColorlabelName', DispatcherVerifyLogin, (req, res) => {
    let Color = req.params.Color;
    let ColorlabelName = req.params.ColorlabelName;
    var Branch = req.session.DispatcherData.Branch;

    console.log("Color" + Color + "  Label:" + ColorlabelName);

    employeeHelpers.CreateNewLabel(Color, ColorlabelName, Branch).then(() => {
        res.json({ Status: true });
    })
})

router.get('/CreateACopyOfCard/:CardID', DispatcherVerifyLogin, (req, res) => {
    employeeHelpers.CreateACopyByCardID(req.params.CardID, req.session.DispatcherData.UserName, req.session.DispatcherData.Designation).then(() => {
        res.json({ Status: true });
    })
})

router.get('/MoveCardToArchived/:CardID', DispatcherVerifyLogin, (req, res) => {
    let CardID = req.params.CardID;
    let UserName = req.session.DispatcherData.UserName;
    let Designation = req.session.DispatcherData.Designation;


    var Data = {
        CardID: CardID,
        newlistname: "ARCHIVED",
        UserName: UserName,
        Designation: Designation,
        Activity: {
            activity: `${UserName} moved the card to Archived`,
            Time: Date.now(),
        }
    }

    // if (Designation === "Production") {
    //     Data.ProductionPerson = DropColumeName;
    // }
    console.log("Data:", Data);
    employeeHelpers.ChangeCardListByCardID(Data).then((data) => {
        //console.log(data);
        res.json({ Status: true });
    })

    // var NewActivity = {
    //     activity: `${UserNow.UserName} moved the card ${CardID} to Archived`,
    //     Time: Date.now()
    // };
    // employeeHelpers.moveCardToArchived(CardID,UserNow,Designation).then(()=>{
    //     res.json({ Status: true });
    // })
})

module.exports = router;