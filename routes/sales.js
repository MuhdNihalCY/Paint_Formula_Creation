var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');
const whatsappHelper = require('../helpers/whatsappHelper');
const multer = require('multer');
var FindGeoss = require('../helpers/geoLoactions');
const useragent = require('useragent');
const adminHelpers = require('../helpers/adminHelpers');
const ExcelJS = require('exceljs');
const { Readable } = require('stream');
const ledgerHelper = require('../helpers/ledgerHelper');



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



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
    const ip = req.ip
    console.log("IP Address: ", ip);
    // FindGeoss.FindGeo(ip).then((Location)=>{
    //     console.log("Locations: ",Location)
    // });


    const userAgentString = req.headers['user-agent'];
    const deviceInfo = useragent.parse(userAgentString);
    console.log("Useragent deviceInfo:", deviceInfo);


    FindGeoss.FindGeoUseIPData(ip);
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
    var Branch = req.session.SalesData.Branch;
    employeeHelpers.GetAllCardsByListName("ORDERS", Branch).then((AllCards) => {
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
    employeeHelpers.GetAllCards(req.session.SalesData.Branch).then((AllCards) => {
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
    // give all cards a branch   
    // employeeHelpers.GiveAllCardABranch().then(()=>{        
    // })

    res.render('sales/SalesCustomTrello', { SalesLogged: req.session.SalesData });
});

router.get('/getAllCardAndListsAndUsersToManagement', (req, res) => {
    var BranchName = req.session.SalesData.Branch;

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

router.post('/saveCustomer', SalesVerifyLogin, (req, res) => {
    employeeHelpers.SaveCustomer(req.body, req.session.SalesData).then((Response) => {
        if (Response.Error) {
            res.json({ Error: Response.Error });
        } else {
            var data = req.body
            data._id = Response.response;
            res.json({ data });
        }
    })
})

router.post('/CreateNewOrder', SalesVerifyLogin, async (req, res) => {
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
        ContactNumber: ContactDetails.CallNumber,
        ContactcountrySelect: ContactDetails.CallCountryCode,
        ContactPersonName: ContactDetails.Name,
        WhatsAppcountrySelect: ContactDetails.WhatsappCountryCode,
        WhatsappNumber: ContactDetails.WhatsappNumber,
        description: "",
        comments: comments,
        Labels: Labels,
        Activity: [{
            activity: `${req.session.SalesData.UserName} created card in Orders.`,
            Time: Date.now()
        }],
        ReadyProducts: ReadyProducts,
        Card_Created: {
            Name: req.session.SalesData.UserName,
            Designation: req.session.SalesData.Designation,
            Time: Date.now()
        }
    }

    if (req.files) {
        NewOrder.IsAttachments = true;
    }

    // adding Branch
    NewOrder.Branch = req.session.SalesData.Branch;

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


router.post('/UpdareCardOrder/:cardID', SalesVerifyLogin, async (req, res) => {
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
    // console.log(productionsItemsArray);

    await productionsItemsArray.forEach((EachItem) => {
        var PushData = {
            Name: EachItem.Name,
            State: "InComplete",
            Qty: EachItem.Qty,
            Unit: EachItem.Unit,
            FileNo: EachItem.FileNo ? EachItem.FileNo : "",
            ColorCode: EachItem.ColorCode,
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



    var NewOrder = {
        Name: data.OrderName,
        OrderIDNumber: data.OrderIDNumber,
        CustomerName: data.CustomerName,
        // CurrentList: "ORDERS",
        // ListArray: [
        //     {
        //         ListName: "ORDERS",
        //         InTIme: Date.now(),
        //         InEmployeeName: req.session.SalesData.UserName,
        //         InEmployeeDesignation: req.session.SalesData.Designation
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
        activity: `${req.session.SalesData.UserName} Updated this card.`,
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


router.get('/ChangeListofCard/:CardID/:NewListName/:Designation', SalesVerifyLogin, (req, res) => {
    let cardID = req.params.CardID;
    let newlistname = req.params.NewListName;
    let Designation = req.params.Designation;

    var UserNow = req.session.SalesData;

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

router.get('/ChangeListofCardName/:CardName/:DropColumeName/:Designation', SalesVerifyLogin, (req, res) => {
    let CardName = req.params.CardName;
    let DropColumeName = req.params.DropColumeName;
    let Designation = req.params.Designation;
    var UserNow = req.session.SalesData;
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

router.get('/CreateNewLabel/:Color/:ColorlabelName', SalesVerifyLogin, (req, res) => {
    let Color = req.params.Color;
    let ColorlabelName = req.params.ColorlabelName;
    var Branch = req.session.SalesData.Branch;

    console.log("Color" + Color + "  Label:" + ColorlabelName);

    employeeHelpers.CreateNewLabel(Color, ColorlabelName, Branch).then(() => {
        res.json({ Status: true });
    })
})

router.get('/CreateACopyOfCard/:CardID', SalesVerifyLogin, (req, res) => {
    employeeHelpers.CreateACopyByCardID(req.params.CardID, req.session.SalesData.UserName, req.session.SalesData.Designation).then(() => {
        res.json({ Status: true });
    })
})

router.get('/MoveCardToArchived/:CardID', SalesVerifyLogin, (req, res) => {
    let CardID = req.params.CardID;
    let UserName = req.session.SalesData.UserName;
    let Designation = req.session.SalesData.Designation;


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

router.get('/Customer', SalesVerifyLogin, (req, res) => {
    res.render('sales/CustomerCollection', { SalesLogged: true });
})

router.post('/Followup/api', (req, res) => {
    req.body.EmployeeName = req.session.SalesData.UserName;
    req.body.Designation = req.session.SalesData.Designation;
    req.body.InsertedTime = Date.now();
    req.body.Branch = req.session.SalesData.Branch;

    employeeHelpers.StoreCustomerFollowUP(req.body).then(() => {
        res.json({ Status: true });
    })
})

router.get('/GetAllFollowup/api', (req, res) => {
    let Branch = req.session.SalesData.Branch
    employeeHelpers.GetAllCustomerFollowUp(Branch).then((data) => {
        res.json(data);
    })
})

router.get('/GetAllCustomersAndFollowUp/api', (req, res) => {
    let Branch = req.session.SalesData.Branch
    employeeHelpers.GetAllCustomersAndFollowups(Branch).then((data) => {
        res.json(data);
    })
})

router.get('/getallorders/api', (req, res) => {
    let Branch = req.session.SalesData.Branch
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

        adminHelpers.AddBranchToEachDatastoreLedgerData(finalOutput, req.body.CustomerName, req.session.SalesData.UserName, req.session.SalesData.Branch).then(() => {
            // res.send(finalOutput);
            res.redirect('/sales/Customer');
        })
    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.get('/GetAllCustomerPurchaseData/api/:CustomerName', SalesVerifyLogin, (req, res) => {
    employeeHelpers.getAllCustomerPurchaseDataByName(req.params.CustomerName).then((AllData) => {
        res.json(AllData);
    })
})


router.get('/Logout', SalesVerifyLogin, (req, res) => {
    req.session.SalesData.destroy();
    res.redirect('/login');
})



module.exports = router;