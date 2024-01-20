var express = require('express');
var router = express.Router();
const trelloHelpers = require('../helpers/trelloHelpers');
const employeeHelpers = require('../helpers/employeeHelpers');
const whatsappHelper = require('../helpers/whatsappHelper');


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


router.get('/getAllCardAndListsAndUsersToManagement', (req, res) => {
    var BranchName = req.session.DriverData.Branch;

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



})

router.get('/ChangeListofCard/:CardID/:NewListName/:Designation', DriverVerifyLogin, (req, res) => {
    let cardID = req.params.CardID;
    let newlistname = req.params.NewListName;
    let Designation = req.params.Designation;

    var UserNow = req.session.DriverData;

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

router.get('/ChangeListofCardName/:CardName/:DropColumeName/:Designation', DriverVerifyLogin, (req, res) => {
    let CardName = req.params.CardName;
    let DropColumeName = req.params.DropColumeName;
    let Designation = req.params.Designation;
    var UserNow = req.session.DriverData;
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

router.get('/CreateNewLabel/:Color/:ColorlabelName', DriverVerifyLogin, (req, res) => {
    let Color = req.params.Color;
    let ColorlabelName = req.params.ColorlabelName;
    var Branch = req.session.DriverData.Branch;

    console.log("Color" + Color + "  Label:" + ColorlabelName);

    employeeHelpers.CreateNewLabel(Color, ColorlabelName, Branch).then(() => {
        res.json({ Status: true });
    })
})

router.get('/CreateACopyOfCard/:CardID', DriverVerifyLogin, (req, res) => {
    employeeHelpers.CreateACopyByCardID(req.params.CardID, req.session.DriverData.UserName, req.session.DriverData.Designation).then(() => {
        res.json({ Status: true });
    })
})

router.get('/MoveCardToArchived/:CardID', DriverVerifyLogin, (req, res) => {
    let CardID = req.params.CardID;
    let UserName = req.session.DriverData.UserName;
    let Designation = req.session.DriverData.Designation;


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