var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');
const whatsappHelper = require('../helpers/whatsappHelper');

const SalesVerifyLogin = (req, res, next) => {
    if (req.session.SalesData) {
        next();
    } else {
        res.redirect('/login');
        // next()
    }
}

router.get('/', SalesVerifyLogin, (req, res, next) => {
    // res.render('sales/home', { SalesLogged: req.session.SalesData });
    res.redirect('/sales/home')
})

router.get('/logout', SalesVerifyLogin, (req, res) => {
    delete req.session.SalesData;
    delete req.session.SalesLogged;
    // res.redirect('/login');
    res.redirect('/sales');
})

router.get('/getAllCardsFromOrders', SalesVerifyLogin, (req, res) => {
    // trelloHelpers.getAllCardsFromOrders().then((Cards) => {
    //     // console.table(Cards);
    //     trelloHelpers.addImageToCardsInArray(Cards).then((AllCards) => {
    //         // console.log(AllCards);
    //         res.json({ AllCards });
    //     })
    // })

    employeeHelpers.GetAllCardsByListName("ORDERS").then((AllCards) => {
        console.log("Orders Cards", AllCards);
        res.json({ AllCards });
    })
})

router.post('/cardUpdated/:CardId', SalesVerifyLogin, (req, res) => {
    // console.log(req.body);
    var Card = req.body;
    Card.id = req.params.CardId
    // console.log(Card);

    employeeHelpers.getOfficeSectionList().then((OfficeSectionList) => {


        employeeHelpers.getCardByID(Card.id).then((OldCardData) => {
            // console.log("Old Card Data: ", OldCardData);
            var UpdatedCard = OldCardData;
            UpdatedCard.CustomerName = Card.CustomerName;
            UpdatedCard.description = Card.description;
            UpdatedCard.ContactcountrySelect = Card.ContactcountrySelect;
            UpdatedCard.ContactNumber = Card.ContactNumber;
            UpdatedCard.WhatsAppcountrySelect = Card.WhatsAppcountrySelect;
            UpdatedCard.WhatsappNumber = Card.WhatsappNumber;
            UpdatedCard.AlternateContactcountrySelect = Card.AlternateContactcountrySelect;
            UpdatedCard.AlternateContactNumber = Card.AlternateContactNumber;
            UpdatedCard.Name = OldCardData.Name + "-" + Card.CustomerName;
            UpdatedCard.CurrentList = OfficeSectionList.Name;

            //put new list data

            OfficeSectionList.ListName = OfficeSectionList.Name;
            OfficeSectionList.InTime = Date.now();
            OfficeSectionList.InEmployeeName = req.session.SalesData.UserName;
            OfficeSectionList.InEmployeeDesignation = req.session.SalesData.Designation;

            delete OfficeSectionList.Name;
            delete OfficeSectionList.OldCards;
            delete OfficeSectionList._id;

            var OldList = UpdatedCard.ListArray[0];

            console.log("OldList: ", OldList);

            OldList.OutTime = Date.now();
            OldList.OutEmployeeName = req.session.SalesData.UserName;
            OldList.OutEmployeeDesignation = req.session.SalesData.Designation;

            UpdatedCard.ListArray.unshift(OfficeSectionList);

            var CheckListItems = {
                CardName: UpdatedCard.Name,
                checkItems: []
            }

            // Iterate through the object's properties
            for (const key in Card) {
                if (key.startsWith('ChecklistItem')) {
                    if (Card[key] !== '') {
                        var oneItem = {
                            Name: Card[key],
                            State: "InComplete"
                        }
                        CheckListItems.checkItems.push(oneItem);
                    }
                }
            }

            // console.log(CheckListItems);

            UpdatedCard.CheckListItems = CheckListItems;

            console.log("Updated Card Data: ", UpdatedCard);

            employeeHelpers.SaveUpdatedCardBy(UpdatedCard, Card.id).then(() => {
                console.log("Moved card from ordres to office section by Sales Person.");
                res.redirect('/sales');
            })

        })
    })
})


router.get('/moveToDoneToday/:cardId', SalesVerifyLogin, (req, res) => {
    var cardID = req.params.cardId;
    console.log("cardID: ", cardID);
    trelloHelpers.moveCardtoDoneTodayByCardID(cardID).then((response) => {
        res.redirect('/sales/CustomerCollection')
    })
})

router.get('/CustomerCollection', SalesVerifyLogin, async (req, res) => {
    res.render('sales/CustomerCollection', { SalesLogged: req.session.SalesData })
})


router.get('/getAllCardsFromCustomerCollection', SalesVerifyLogin, async (req, res) => {
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


router.get('/getAllCardsFromBoard', SalesVerifyLogin, (req, res) => {
    // trelloHelpers.getAllCardsFromBoard().then((Cards) => {
    //     // console.table(Cards);
    //     trelloHelpers.addImageToCardsInArray(Cards).then((AllCard) => {
    //         trelloHelpers.AddListToCards(AllCard).then((AllCards) => {
    //             // console.log(AllCards);
    //             res.json({ AllCards });
    //         })
    //     })
    // })
    employeeHelpers.GetAllCards().then((AllCards) => {
        res.json({ AllCards });
    })
})


router.get('/AllFormula', SalesVerifyLogin, (req, res) => {
    employeeHelpers.GetAllFormulations().then((Formula) => {
        console.log(Formula);
    })
})


router.get('/api/OrderDeliver/whatsapp/:cardID/:DeliveryLocation', SalesVerifyLogin, (req, res) => {

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

                res.redirect('/sales/CustomerCollection')
            })

        })

    })
})

router.get('/home', SalesVerifyLogin, (req, res) => {
    res.render('sales/SalesCustomTrello', { SalesLogged: req.session.SalesData });
});

router.post('/saveCustomer', SalesVerifyLogin, (req, res) => {
    employeeHelpers.SaveCustomer(req.body).then((id) => {
        var data = req.body
        data._id = id;
        res.json({ data });
    })
})

router.post('/CreateNewOrder', SalesVerifyLogin, async (req, res) => {
    console.log("Order Creating", req.body);
    var data = req.body;

    // ContactDetails: {
    //     Name: 'dfgdfdf',
    //     CallCountryCode: '+971',
    //     CallNumber: '4334534',
    //     WhatsappCountryCode: '+971',
    //     WhatsappNumber: '34534'
    //   }

    var CheckItems = [];

    await data.ProductionsItems.forEach((EachItem) => {
        CheckItems.push({
            Name: EachItem.Name,
            State: "InComplete",
            Qty: EachItem.Qty,
            Unit: EachItem.Unit,
            FileNo: EachItem.FileNo ? EachItem.FileNo : ""
        })
    })



    var NewOrder = {
        Name: data.OrderName,
        CurrentList: "ORDERS",
        ListArray: [
            {
                ListName: "ORDERS",
                InTIme: Date.now(),
                InEmployeeName: req.session.SalesData.UserName,
                InEmployeeDesignation: req.session.SalesData.Designation
            }
        ],
        AlternateContactNumber: "",
        AlternateContactcountrySelect: "",
        CheckListItems: {
            CardName: "ORDERS",
            checkItems: CheckItems
        },
        ContactNumber: data.ContactDetails.CallNumber,
        ContactcountrySelect: data.ContactDetails.CallCountryCode,
        ContactPersonName: data.ContactDetails.Name,
        CustomerName: data.ContactDetails.Name,
        WhatsAppcountrySelect: data.ContactDetails.WhatsappCountryCode,
        WhatsappNumber: data.ContactDetails.WhatsappNumber,
        description: "",
        comments:data.comments,
        Labels:data.Labels
    }

    console.log("New Card: ", NewOrder);

    employeeHelpers.InsertNewCard(NewOrder).then(()=>{
        res.json({State:true});
    })
})






module.exports = router;