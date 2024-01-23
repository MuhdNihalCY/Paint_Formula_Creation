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
    // OfficeLogged.UserName
    // whatsappHelper.SendTestMessage().then(()=>{ 
    // })

    res.render('office/OfficeCustomTrello', { OfficeLogged: req.session.OfficeData });
});

router.get('/getAllCardAndListsAndUsersToManagement', (req, res) => {
    var BranchName = req.session.OfficeData.Branch;

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
    // employeeHelpers.GetAllCards(BranchName).then((AllCards) => {
    //     //  console.log(AllCards);
    //     employeeHelpers.getAllLists(BranchName).then((AllLists) => {
    //         employeeHelpers.getAllUsers(BranchName).then((AllUsers) => {
    //             employeeHelpers.getAllCustomers(BranchName).then((AllCustomers) => {
    //                 employeeHelpers.GetAllFormulations().then((Formulas) => {
    //                     employeeHelpers.getAllMeasuringUnitOfAllFormulas(Formulas).then((UpdatedFromuls) => {
    //                         employeeHelpers.getAllLabels(BranchName).then((AllLabels) => {

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

router.post('/saveCustomer', OfficeVerifyLogin, (req, res) => {
    employeeHelpers.SaveCustomer(req.body, req.session.OfficeData).then((Response) => {
        if (Response.Error) {
            res.json({ Error: Response.Error });
        } else {
            var data = req.body
            data._id = Response.response;
            res.json({ data });
        }
    })
})


router.post('/CreateNewOrder', OfficeVerifyLogin, async (req, res) => {
    console.log("Order Creating", req.body);
    var data = req.body;
    const imageData = req.files;

    var CheckItems = [];

    let productionsItemsArray = await JSON.parse(data.ProductionsItems);
    let ContactDetails = await JSON.parse(data.ContactDetails);
    let comments = await JSON.parse(data.comments);
    let Labels = await JSON.parse(data.Labels);
    let ReadyProducts = await JSON.parse(data.ReadyProducts);
    // console.log(productionsItemsArray);

    await productionsItemsArray.forEach((EachItem) => {
        var PushData = {
            Name: EachItem.Name,
            State: "InComplete",
            Qty: EachItem.Qty,
            Unit: EachItem.Unit,
            FileNo: EachItem.FileNo ? EachItem.FileNo : "",
            ColorCode: EachItem.ColorCode,
            SubCategoryName: EachItem.SubCategoryName
        }
        if (EachItem.matt) {
            PushData.matt = EachItem.Matt
        }
        if (EachItem.gloss) {
            PushData.gloss = EachItem.Gloss
        }

        CheckItems.push(PushData);
    })



    var NewOrder = {
        Name: data.OrderName,
        OrderIDNumber: data.OrderIDNumber,
        CustomerName: data.CustomerName,
        CurrentList: "ORDERS",
        ListArray: [
            {
                ListName: "ORDERS",
                InTIme: Date.now(),
                InEmployeeName: req.session.OfficeData.UserName,
                InEmployeeDesignation: req.session.OfficeData.Designation
            }
        ],
        AlternateContactNumber: "",
        AlternateContactcountrySelect: "",
        CheckListItems: {
            CardName: "ORDERS",
            checkItems: CheckItems
        },
        ContactNumber: ContactDetails.CallNumber,
        ContactcountrySelect: ContactDetails.CallCountryCode,
        ContactPersonName: ContactDetails.Name,
        WhatsAppcountrySelect: ContactDetails.WhatsappCountryCode,
        WhatsappNumber: ContactDetails.WhatsappNumber,
        description: "",
        comments: comments,
        Labels: Labels,
        Activity: [{
            activity: `${req.session.OfficeData.UserName} created card in Orders.`,
            Time: Date.now()
        }],
        ReadyProducts: ReadyProducts,
        Card_Created: {
            Name: req.session.OfficeData.UserName,
            Designation: req.session.OfficeData.Designation,
            Time: Date.now()
        }
    }

    if (req.files) {
        NewOrder.IsAttachments = true;
    }

    // adding Branch
    NewOrder.Branch = req.session.OfficeData.Branch;

    console.log("New Card: ", NewOrder);



    employeeHelpers.InsertNewCard(NewOrder).then((CardId) => {
        if (req.files) {
            const imageData = req.files.file;
            // console.log('Image data:', imageData);

            imageData.mv('./public/images/Attachments/' + CardId + ".jpg", (err) => {
                if (!err) {
                } else {
                    console.log("Error at img1 " + err)
                }
            })
        }
        res.json({ State: true });
    })
})

router.post('/UpdareCardOrder/:cardID', OfficeVerifyLogin, async (req, res) => {
    console.log("Order Creating Updating: ", req.body);
    var data = req.body;
    const imageData = req.files;
    var cardID = req.params.cardID;

    //console.log("imageData", imageData);
    // ContactDetails: {
    //     Name: 'dfgdfdf',
    //     CallCountryCode: '+971',
    //     CallNumber: '4334534',
    //     WhatsappCountryCode: '+971',
    //     WhatsappNumber: '34534'
    //   }

    var CheckItems = [];

    let productionsItemsArray = await JSON.parse(data.ProductionsItems);
    let ContactDetails = await JSON.parse(data.ContactDetails);
    let comments = await JSON.parse(data.comments);
    let Labels = await JSON.parse(data.Labels);
    let ReadyProducts = await JSON.parse(data.ReadyProducts);

    console.log("productionsItemsArray: ", productionsItemsArray);
    await productionsItemsArray.forEach((EachItem) => {
        console.log("Each Item: ", EachItem);
        var PushData = {
            Name: EachItem.Name,
            State: "InComplete",
            Qty: EachItem.Qty,
            Unit: EachItem.Unit,
            FileNo: EachItem.FileNo ? EachItem.FileNo : "",
            FormulaColorName: EachItem.FormulaColorName,
            FormulaColorCode: EachItem.FormulaColorCode,
            SubCategoryName: EachItem.SubCategoryName,

        }

        if (EachItem.matt) {
            PushData.matt = EachItem.Matt
        }
        if (EachItem.gloss) {
            PushData.gloss = EachItem.Gloss
        }

        CheckItems.push(PushData)
    })
    console.log("CheckItems:", CheckItems);



    var NewOrder = {
        Name: data.OrderName,
        OrderIDNumber: data.OrderIDNumber,
        CustomerName: data.CustomerName,
        // CurrentList: "ORDERS",
        // ListArray: [
        //     {
        //         ListName: "ORDERS",
        //         InTIme: Date.now(),
        //         InEmployeeName: req.session.OfficeData.UserName,
        //         InEmployeeDesignation: req.session.OfficeData.Designation
        //     }
        // ],
        AlternateContactNumber: "",
        AlternateContactcountrySelect: "",
        CheckListItems: {
            // CardName: "ORDERS",
            checkItems: CheckItems
        },
        ContactNumber: ContactDetails.CallNumber,
        ContactcountrySelect: ContactDetails.CallCountryCode,
        ContactPersonName: ContactDetails.Name,
        WhatsAppcountrySelect: ContactDetails.WhatsappCountryCode,
        WhatsappNumber: ContactDetails.WhatsappNumber,
        description: "",
        comments: comments,
        Labels: Labels,
        ReadyProducts: ReadyProducts
    }

    if (req.files) {
        NewOrder.IsAttachments = true;
    }

    console.log("New Card updated: ", NewOrder);

    var Activity = {
        activity: `${req.session.OfficeData.UserName} Updated this card.`,
        Time: Date.now()
    }

    employeeHelpers.UpdateCard(NewOrder, cardID, Activity).then((CardId) => {
        if (req.files) {
            const imageData = req.files.file;
            // console.log('Image data:', imageData);

            imageData.mv('./public/images/Attachments/' + CardId + ".jpg", (err) => {
                if (!err) {
                } else {
                    console.log("Error at img1 " + err)
                }
            })
        }
        res.json({ State: true });
    })
})


router.get('/ChangeListofCard/:CardID/:NewListName/:Designation', OfficeVerifyLogin, (req, res) => {
    let cardID = req.params.CardID;
    let newlistname = req.params.NewListName;
    let Designation = req.params.Designation;

    var UserNow = req.session.OfficeData;

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

router.get('/ChangeListofCardName/:CardName/:DropColumeName/:Designation', OfficeVerifyLogin, (req, res) => {
    let CardName = req.params.CardName;
    let DropColumeName = req.params.DropColumeName;
    let Designation = req.params.Designation;
    var UserNow = req.session.OfficeData;
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

router.get('/CreateNewLabel/:Color/:ColorlabelName', OfficeVerifyLogin, (req, res) => {
    let Color = req.params.Color;
    let ColorlabelName = req.params.ColorlabelName;
    var Branch = req.session.OfficeData.Branch;

    console.log("Color" + Color + "  Label:" + ColorlabelName);

    employeeHelpers.CreateNewLabel(Color, ColorlabelName, Branch).then(() => {
        res.json({ Status: true });
    })
})

router.get('/CreateACopyOfCard/:CardID', OfficeVerifyLogin, (req, res) => {
    employeeHelpers.CreateACopyByCardID(req.params.CardID, req.session.OfficeData.UserName, req.session.OfficeData.Designation).then(() => {
        res.json({ Status: true });
    })
})

router.get('/MoveCardToArchived/:CardID', OfficeVerifyLogin, (req, res) => {
    let CardID = req.params.CardID;
    let UserName = req.session.OfficeData.UserName;
    let Designation = req.session.OfficeData.Designation;


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

router.get('/Customer', OfficeVerifyLogin, (req, res) => {
    res.render('office/CustomerCollection', { OfficeLogged: true });
})

router.post('/Followup/api', (req, res) => {
    req.body.EmployeeName = req.session.OfficeData.UserName;
    req.body.Designation = req.session.OfficeData.Designation;
    req.body.InsertedTime = Date.now();
    req.body.Branch = req.session.OfficeData.Branch;

    employeeHelpers.StoreCustomerFollowUP(req.body).then(() => {
        res.json({ Status: true });
    })
})

router.get('/GetAllFollowup/api', (req, res) => {
    let Branch = req.session.OfficeData.Branch
    employeeHelpers.GetAllCustomerFollowUp(Branch).then((data) => {
        res.json(data);
    })
})

router.get('/GetAllCustomersAndFollowUp/api', (req, res) => {
    let Branch = req.session.OfficeData.Branch
    employeeHelpers.GetAllCustomersAndFollowups(Branch).then((data) => {
        res.json(data);
    })
})

router.get('/getallorders/api', (req, res) => {
    let Branch = req.session.OfficeData.Branch
    employeeHelpers.GetAllPurchasedOrders(Branch).then((AllOrders) => {
        res.json(AllOrders);
    })
})

router.post('/uploadLedgerData', async (req, res) => {

    try {
        // Check if the file was uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // The uploaded file is available in req.files.excelFile
        const excelFile = req.files.excelFile;
        // Example: Log the file details
        console.log('Uploaded File:', excelFile);

        // Get start data and end data
        let data = [];
        // Create a new workbook using exceljs
        const workbook = new ExcelJS.Workbook();

        // Use the file data directly from req.files.excelFile.data
        await workbook.xlsx.load(excelFile.data);

        // Get the last worksheet
        const lastSheet = workbook.getWorksheet(workbook.worksheets.length);

        // Convert the last sheet to JSON
        const lastSheetData = lastSheet.getSheetValues();

        // Append the data to the result array
        data.push(...lastSheetData);

        const TestDatas = await ledgerHelper.doSomeSampleTest(data);
        const datas = await ledgerHelper.doAdvancedSampleTest(TestDatas.Arrays);

        // Get table data.
        // Convert the Buffer to a Readable stream
        const stream = new Readable();
        stream.push(excelFile.data);
        stream.push(null);

        const workbookTable = new ExcelJS.Workbook();
        await workbookTable.xlsx.read(stream);

        // Get the last sheet for table data
        const lastSheetTable = workbookTable.getWorksheet(workbookTable.worksheets.length);

        // Extract column names from the 8th row
        const columnNames = lastSheetTable.getRow(8).values;

        // Map the keys to the desired format for table data
        const mappedData = [];
        lastSheetTable.eachRow({ includeEmpty: false, range: 9 }, (row, rowNumber) => {
            const rowData = {};
            row.values.forEach((value, index) => {
                rowData[columnNames[index]] = value;
            });
            mappedData.push(rowData);
        });

        const UpdatedMapedData = await ledgerHelper.OranizeTableData(mappedData, datas.Objects);

        // After all are executed, proceed to res.send
        const finalOutput = datas.Objects

        finalOutput.TableData = UpdatedMapedData

        adminHelpers.AddBranchToEachDatastoreLedgerData(finalOutput, req.body.CustomerName, req.session.OfficeData.UserName, req.session.OfficeData.Branch).then(() => {
            // res.send(finalOutput);
            res.redirect('/office/Customer');
        })
    } catch (error) {
        res.status(500).send(error.message);
    }

});


router.get('/ChangeEmployeeDutyState/:EmployeeName/:OnDutyStatus', OfficeVerifyLogin, (req, res) => {
    employeeHelpers.ChangeEmployeeDutyState(req.params.EmployeeName, req.params.OnDutyStatus).then(() => {
        res.json({ State: true });
    })
})








module.exports = router;