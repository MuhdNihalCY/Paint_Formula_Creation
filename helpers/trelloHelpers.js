var express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const employeeHelpers = require('./employeeHelpers');
const FormData = require('form-data');
const fs = require('fs');
var app = express();
var path = require('path');


const ApiKey = process.env.TrelloApiKey;
const Token = process.env.TrelloToken;
const BoardID = process.env.BoardID;


module.exports = {

    trelloTest: () => {
        return new Promise(async (resolve, reject) => {

            const APIKey = ApiKey; // Replace with your actual API key
            const APIToken = Token; // Replace with your actual API token

            axios.get(`https://api.trello.com/1/boards/6526f124438d4449ea07520e/lists?key=${APIKey}&token=${APIToken}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    // return response.data; // Use response.data to access the JSON response
                    console.log(response.data);
                })
                .catch(error => console.error(error));


        })

    },
    getAllList: () => {
        return new Promise(async (resolve, reject) => {


            axios.get(`https://api.trello.com/1/boards/${BoardID}/lists?key=${ApiKey}&token=${Token}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    // return response.data; // Use response.data to access the JSON response
                    // console.log(response.data);
                    resolve(response.data);
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        })
    },
    getCardByID: (id) => {
        return new Promise(async (resolve, reject) => {


            axios.get(`https://api.trello.com/1/cards/${id}?key=${ApiKey}&token=${Token}`, { //'https://api.trello.com/1/cards/{id}?key=APIKey&token=APIToken'
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    // return response.data; // Use response.data to access the JSON response
                    // console.log("card Data: ", response.data);
                    resolve(response.data);
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        })
    },
    addTrelloCard: (data) => {
        return new Promise(async (resolve, reject) => {

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0, so add 1
            var yy = String(today.getFullYear()).slice(-2); // Get the last 2 digits of the year

            var cardName = `${dd}-${mm}-${yy}-${data.InsertedTime}`;
            console.log("card Name: ", cardName);



            function incrementLastSection(oldCardName) {
                // Split the input string into sections using the hyphen as a delimiter
                const sections = oldCardName.split('-');
                // Extract the last section
                const lastSection = sections.slice(-1)[0];
                // Increment the last section as a number
                const incrementedValue = Number(lastSection) + 1;
                // Replace the last section in the array with the incremented value
                sections[sections.length - 1] = String(incrementedValue);
                // Join the sections back together with hyphens
                const newCardName = sections.join('-');
                return newCardName;
            }

            async function checkCardNameForDuplicates(cardName) {
                try {
                    const isSameCard = await employeeHelpers.GetSameCardByCardName(cardName);
                    console.log("isSameCard: ", isSameCard);

                    if (isSameCard.Status) {
                        cardName = incrementLastSection(cardName);
                        console.log("Duplicate CardName Found!");
                        console.log("Updated Card Name.");
                        return checkCardNameForDuplicates(cardName); // Recursive call
                    }

                    // Return the unique card name
                    return cardName;
                } catch (error) {
                    console.error("Error while checking for duplicates:", error);
                    return cardName; // Return the original cardName on error
                }
            }

            (async () => {
                cardName = await checkCardNameForDuplicates(cardName);
                console.log("Unique Card Name:", cardName);

                var AllLists;
                var OrdersListData;

                try {
                    AllLists = await module.exports.getAllList();
                    // console.log("All Lists:", AllLists);
                } catch (error) {
                    console.error(error);
                }

                //console.log("All Lists: outside: ", AllLists);

                for (let i = 0; i < AllLists.length; i++) {
                    if (AllLists[i].name === "Order") {
                        OrdersListData = AllLists[i];
                    }
                }

                console.log("Orders List: ", OrdersListData);
                var idList = OrdersListData.id;

                // create card data
                const cardData = {
                    name: cardName,
                    desc: "",
                };

                // store card in the database
                employeeHelpers.StoreCardData(cardData).then(() => { });

                var CardDetails

                // form the card
                const url = `https://api.trello.com/1/cards?idList=${idList}&key=${ApiKey}&token=${Token}`;

                axios
                    .post(url, cardData, {
                        headers: {
                            'Accept': 'application/json',
                        }
                    })
                    .then(async (response) => {
                        if (response.status === 200) {
                            const card = response.data;
                            console.log("card:", card);
                            CardDetails = card;
                            AddAttachment(card)
                            await employeeHelpers.SaveCardIDToOrder(data.FileName, CardDetails.id)
                            // resolve(CardDetails.id);
                        } else {
                            console.log("Error response:", response.status, response.statusText);
                            console.log("Error data:", response.data);
                            reject(response.data);
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error.message);
                        reject(error);
                    });



                // add attachment
                function AddAttachment(CardDetails) {

                    console.log("Card Details: ".CardDetails);


                    // Define the local source path of the image
                    //const imagePath = 'public/image.png'; // Update the path to your image
                    const publicFolderPath = path.join(__dirname, '..', 'public');
                    app.use(express.static(publicFolderPath));
                    // Get the path to the public folder.
                    const sourceImagePath = path.join(publicFolderPath, 'images', 'RefImages', `${data.FileName}.jpg`);
                    console.log(sourceImagePath);

                    // Check if the file exists before reading it
                    if (fs.existsSync(sourceImagePath)) {
                        // Create a new FormData object to send the data as multipart/form-data
                        const formData = new FormData();


                        // Read the image file as binary data and add it to the formData
                        const imageBuffer = fs.readFileSync(sourceImagePath);
                        formData.append('file', imageBuffer, `${data.FileName}.jpg`);

                        // console.log("CardDetails : ", CardDetails);


                        // Send the POST request to attach the image to the card
                        axios.post(`https://api.trello.com/1/cards/${CardDetails.id}/attachments?key=${ApiKey}&token=${Token}`, formData, {
                            headers: {
                                ...formData.getHeaders(), // Include the proper headers for multipart/form-data
                                'Accept': 'application/json'
                            }
                        })
                            .then(response => {
                                console.log(`Response: ${response.status} ${response.statusText}`);
                                console.log("Added Attachement : ", response.data);
                                resolve(CardDetails.id);
                            })
                            .catch(error => {
                                console.error(error)
                                reject(error)
                            });

                    } else {
                        // The file does not exist, handle the error
                        console.error('File does not exist:', sourceImagePath);
                        // reject('File does not exist');
                        resolve(CardDetails.id)
                    }
                }
            })();
        })
    },

    getAllCardsFromOrders: () => {
        return new Promise(async (resolve, reject) => {
            var OrdersListData;
            var OrdersListID;
            let OrderSectionFound = false;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "Order") {
                    OrdersListData = AllLists[i];
                    // console.log("OrdersListData: ", OrdersListData);
                    OrdersListID = OrdersListData.id;
                    try {
                        var AllCards = await module.exports.getAllcardsFromCardID(OrdersListID);
                        //  console.log("All cards:", AllCards);
                        resolve(AllCards)
                    } catch (error) {
                        console.error(error);
                    }
                    OrderSectionFound = true;
                    break;
                }
            }
            if (!OrderSectionFound) {
                console.log("No 'Order' list found.");
                resolve({ status: false });
            }
            // resolve(OrdersListData);
        })
    },

    getAllcardsFromCardID: (cardID) => {
        return new Promise(async (resolve, reject) => {
            console.log("Getting Card!");
            try {
                console.log(cardID);
                // console.log(`https://api.trello.com/1/lists/${cardID}/cards?key=${ApiKey}&token=${Token}`);
                const response = await axios.get(`https://api.trello.com/1/lists/${cardID}/cards?key=${ApiKey}&token=${Token}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                console.log("Cards Data: ", response.data);
                console.log(`Response: ${response.status} ${response.statusText}`);
                resolve(response.data);
            } catch (error) {
                console.log("Error Happened!")
                console.error(error);
                reject(error);
            }
        })
    },
    // getAllcardsFromCardID: (cardID) => {
    //     console.log(cardID);
    //     return new Promise(async (resolve, reject) => {
    //         console.log("getiign card!");
    //         await axios.get(`https://api.trello.com/1/lists/652c3b0715a63afcc95708b1/cards?key=${ApiKey}&token=${Token}`, {
    //             headers: {
    //                 'Accept': 'application/json'
    //             }
    //         })
    //         .then(response => {
    //                 console.log("cards Data: ", response);
    //                 console.log(`Response: ${response.status} ${response.statusText}`);
    //                 // return response.data; // Use response.data to access the JSON response
    //                 resolve(response.data);
    //             })
    //             .catch(error => {
    //                 console.error(error);
    //                 reject(error);
    //             });
    //     })
    // },
    addImageToCardsInArray: (AllCard) => {
        return new Promise(async (resolve, reject) => {
            // Create an array of promises for the image requests
            const imagePromises = AllCard.map(async (card) => {
                const cardId = card.id;
                const attachmentID = card.idAttachmentCover;
                if (attachmentID) {
                    const apiUrl = `https://api.trello.com/1/cards/${cardId}/attachments/${attachmentID}?key=${ApiKey}&token=${Token}`;

                    try {
                        const response = await axios.get(apiUrl, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        // console.log(response.data.url)
                        card.ImageUrl = response.data.url;
                    } catch (error) {
                        console.error('Error fetching image:', error);
                    }
                }
            });

            // Wait for all promises to resolve
            await Promise.all(imagePromises);

            resolve(AllCard);
        });
    },
    UpdateCardNameandDescriptionAndMoveToOffice: (NewcardData, OldCardData) => {
        return new Promise(async (resolve, reject) => {
            const cardId = NewcardData.id;
            const newCardName = OldCardData.name + "-" + NewcardData.CustomerName;
            const NewDescription = NewcardData.description;
            var OfficeSectionList;
            var OfficeSectionID;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "OFFICE SECTION") {
                    OfficeSectionList = AllLists[i];
                    console.log("Office section: ", OfficeSectionList);
                    OfficeSectionID = OfficeSectionList.id;
                    break;
                }
            }





            await axios.put(`https://api.trello.com/1/cards/${cardId}`, null, {
                params: {
                    key: ApiKey,
                    token: Token,
                    name: newCardName,
                    desc: NewDescription,
                    idList: OfficeSectionID
                },
            })
                .then(response => {
                    console.log(`Response: ${response.data} `);
                    resolve(response.data);
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error(error)
                    reject(error)
                });
        })
    },
    createNewChecklistAndItems: (NewcardData) => {
        return new Promise(async (resolve, reject) => {
            const cardId = NewcardData.id;
            const checklistName = 'Checklist';

            // Extract checklist items from NewcardData
            var checklistItems = [];
            for (const key in NewcardData) {
                if (key.startsWith('ChecklistItem')) {
                    checklistItems.push(NewcardData[key]);
                }
            }

            // Remove null or empty strings from the array
            const filteredChecklistItems = checklistItems.filter(item => item !== null && item !== '');
            checklistItems = filteredChecklistItems;


            // Create a new checklist
            axios.post(`https://api.trello.com/1/checklists`, null, {
                params: {
                    idCard: cardId,
                    name: checklistName,
                    key: ApiKey,
                    token: Token,
                },
            }).then((response) => {
                console.log(`Response: ${response.status} ${response.statusText}`);
                return response.data;
            }).then(async (checklist) => {
                console.log('Created Checklist:', checklist);

                // Add checklist items
                const addItemPromises = checklistItems.map(async (itemName) => {
                    await axios.post(
                        `https://api.trello.com/1/checklists/${checklist.id}/checkItems`,
                        null,
                        {
                            params: {
                                name: itemName.toString(),
                                key: ApiKey, // Replace with your API key
                                token: Token, // Replace with your API token
                            },
                        }
                    );
                });

                console.log("Added Items");
                const itemStatuses = await Promise.all(addItemPromises)
                    .catch((error) => {
                        console.error("Error adding checklist items:", error);
                        // You can reject the promise here if needed
                        reject(error);
                    });

                // console.log("itemStatuses: ", itemStatuses);
                resolve(itemStatuses);
            })

        });
    },
    getAllCardsFromOfficeSection: () => {
        return new Promise(async (resolve, reject) => {
            var OrdersListData;
            var OrdersListID;
            let officeSectionFound = false; // Flag to track if the office section is found

            try {
                AllLists = await module.exports.getAllList();
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "OFFICE SECTION") {
                    OrdersListData = AllLists[i];
                    console.log("OrdersListData: ", OrdersListData);
                    OrdersListID = OrdersListData.id;
                    try {
                        var AllCards = await module.exports.getAllcardsFromCardID(OrdersListID);
                        console.log("All cards:", AllCards);
                        resolve(AllCards);
                    } catch (error) {
                        console.error(error);
                    }
                    officeSectionFound = true; // Set the flag to true if the office section is found
                    break;
                }
            }

            if (!officeSectionFound) {
                console.log("No 'OFFICE SECTION' list found.");
                resolve({ status: false });
            }
        })
    },
    getChecklistFromCheckListID: (ChecklistID) => {
        return new Promise(async (resolve, reject) => {
            console.log(`https://api.trello.com/1/checklists/${ChecklistID}?key=${ApiKey}&token=${Token}`);
            await axios.get(`https://api.trello.com/1/checklists/${ChecklistID}?key=${ApiKey}&token=${Token}`, {
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    // return response.data; // Use response.data to access the JSON response
                    console.log(response.data.checkItems);
                    resolve(response.data.checkItems);
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        })
    },
    moveCardtoReadyToDispatchByCardID: (CardID) => {
        return new Promise(async (resolve, reject) => {
            var AllLists;
            var DispatcherList;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            //console.log("All Lists: outside: ", AllLists);

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "READY FOR DISPATCH") {
                    DispatcherList = AllLists[i];
                    break;
                }
            }

            console.log("Dispatcher List: ", DispatcherList);
            var idList = DispatcherList.id;
            console.log("Dispatcher List ID: ", idList);


            // update the list from the card or move card to dispatcher
            await axios.put(`https://api.trello.com/1/cards/${CardID}`, null, {
                params: {
                    key: ApiKey,
                    token: Token,
                    idList: idList
                },
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    resolve(response.data);
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error(error)
                    reject(error)
                });

        })
    },
    moveCardToProduction: (CardID, ProductionPerson) => {
        return new Promise(async (resolve, reject) => {
            var AllLists;
            var ProductionList;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            //console.log("All Lists: outside: ", AllLists);

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === ProductionPerson) {
                    ProductionList = AllLists[i];
                    break;
                }
            }

            console.log("Production List: ", ProductionList);
            var idList = ProductionList.id;
            console.log("Production List ID: ", idList);


            // update the list from the card or move card to dispatcher
            await axios.put(`https://api.trello.com/1/cards/${CardID}`, null, {
                params: {
                    key: ApiKey,
                    token: Token,
                    idList: idList
                },
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    resolve(response.data);
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error(error)
                    reject(error)
                });
        })
    },

    //admin

    AddListForPeople: (UserName) => {
        return new Promise(async (resolve, reject) => {
            await axios.post(
                `https://api.trello.com/1/lists`,
                null,
                {
                    params: {
                        name: UserName.toString(),
                        idBoard: BoardID,
                        key: ApiKey, // Replace with your API key
                        token: Token, // Replace with your API token
                    },
                }
            ).then((response) => {
                resolve(response);
            })
        })
    },


    //Dispatcher

    getAllCardsFromDispatcherSection: () => {
        return new Promise(async (resolve, reject) => {
            var DispatchListData;
            var DispatchListID;
            let DispatchSectionFound = false; // Flag to track if the office section is found

            try {
                AllLists = await module.exports.getAllList();
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "READY FOR DISPATCH") {
                    DispatchListData = AllLists[i];
                    console.log("OrdersListData: ", DispatchListData);
                    DispatchListID = DispatchListData.id;
                    try {
                        var AllCards = await module.exports.getAllcardsFromCardID(DispatchListID);
                        console.log("All cards:", AllCards);
                        resolve(AllCards);
                    } catch (error) {
                        console.error(error);
                    }
                    DispatchSectionFound = true; // Set the flag to true if the office section is found
                    break;
                }
            }

            if (!DispatchSectionFound) {
                console.log("No 'READY FOR DISPATCH' list found.");
                resolve({ status: false });
            }
        })
    },
    moveCardtoCustomerCollectionByCardID: (CardID) => {
        return new Promise(async (resolve, reject) => {
            var AllLists;
            var Customer_CollectionList;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            //console.log("All Lists: outside: ", AllLists);

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "Customer Collection") {
                    Customer_CollectionList = AllLists[i];
                    break;
                }
            }

            console.log("Customer_Collection List: ", Customer_CollectionList);
            var idList = Customer_CollectionList.id;
            console.log("Customer_Collection List ID: ", idList);


            // update the list from the card or move card to dispatcher
            await axios.put(`https://api.trello.com/1/cards/${CardID}`, null, {
                params: {
                    key: ApiKey,
                    token: Token,
                    idList: idList
                },
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    resolve(response.data);
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error(error)
                    reject(error)
                });

        })
    },
    moveCardToDriver: (CardID, Driver) => {
        return new Promise(async (resolve, reject) => {
            var AllLists;
            var DriverList;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            //console.log("All Lists: outside: ", AllLists);

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === Driver) {
                    DriverList = AllLists[i];
                    break;
                }
            }

            console.log("Driver List: ", DriverList);
            var idList = DriverList.id;
            console.log("Driver List ID: ", idList);


            // update the list from the card or move card to dispatcher
            await axios.put(`https://api.trello.com/1/cards/${CardID}`, null, {
                params: {
                    key: ApiKey,
                    token: Token,
                    idList: idList
                },
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    resolve(response.data);
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error(error)
                    reject(error)
                });
        })
    },


    // Production

    GetAllCardsFromProductionByPersonName: (ProductionPerson) => {
        return new Promise(async (resolve, reject) => {
            var ProductionListData;
            var ProductionListID;
            let ProductionSectionFound = false; // Flag to track if the office section is found

            try {
                AllLists = await module.exports.getAllList();
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === ProductionPerson) {
                    ProductionListData = AllLists[i];
                    console.log("ProductionListData: ", ProductionListData);
                    ProductionListID = ProductionListData.id;
                    try {
                        var AllCards = await module.exports.getAllcardsFromCardID(ProductionListID);
                        console.log("All cards:", AllCards);
                        resolve(AllCards);
                    } catch (error) {
                        console.error(error);
                    }
                    ProductionSectionFound = true; // Set the flag to true if the office section is found
                    break;
                }
            }

            if (!ProductionSectionFound) {
                console.log("No 'Production' list found.");
                resolve({ status: false });
            }

        })
    },
    ChangeStateOfCheckItem: (CheckListNeedToChange) => {
        return new Promise(async (resolve, reject) => {
            const promises = [];

            for (let i = 0; i < CheckListNeedToChange.length; i++) {
                const CheckItem = CheckListNeedToChange[i];
                const CardId = CheckItem.CardId;
                const CheckId = CheckItem.CheckId;

                const promise = axios.put(`https://api.trello.com/1/cards/${CardId}/checkItem/${CheckId}`, null, {
                    params: {
                        key: ApiKey,
                        token: Token,
                        state: CheckItem.state,
                    },
                });

                promises.push(promise);
            }

            Promise.all(promises)
                .then((responses) => {
                    for (const response of responses) {
                        console.log(`Response: ${response.status} ${response.statusText}`);
                    }
                    resolve(responses); // Resolve with an array of responses
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    },


    // Driver
    getAllCardsFromDriverSection:(DirvarName)=>{
        console.log("DirvarName : ",DirvarName);
        return new Promise(async(resolve,reject)=>{
            var DriverListData;
            var DriverListID;
            let DriverSectionFound = false; // Flag to track if the office section is found

            try {
                AllLists = await module.exports.getAllList();
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === DirvarName) {
                    DriverListData = AllLists[i];
                    console.log("DriverListData: ", DriverListData);
                    DriverListID = DriverListData.id;
                    try {
                        var AllCards = await module.exports.getAllcardsFromCardID(DriverListID);
                        console.log("All cards:", AllCards);
                        resolve(AllCards);
                    } catch (error) {
                        console.error(error);
                    }
                    DriverSectionFound = true; // Set the flag to true if the office section is found
                    break;
                }
            }

            if (!DriverSectionFound) {
                console.log("No 'Driver' list found.");
                resolve({ status: false });
            } 
        })
    },
    moveCardtoDoneTodayByCardID: (CardID) => {
        return new Promise(async (resolve, reject) => {
            var AllLists;
            var Customer_CollectionList;

            try {
                AllLists = await module.exports.getAllList();
                // console.log("All Lists:", AllLists);
            } catch (error) {
                console.error(error);
            }

            //console.log("All Lists: outside: ", AllLists);

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "DONE TODAY") {
                    Customer_CollectionList = AllLists[i];
                    break;
                }
            }

            console.log("Customer_Collection List: ", Customer_CollectionList);
            var idList = Customer_CollectionList.id;
            console.log("Customer_Collection List ID: ", idList);


            // update the list from the card or move card to dispatcher
            await axios.put(`https://api.trello.com/1/cards/${CardID}`, null, {
                params: {
                    key: ApiKey,
                    token: Token,
                    idList: idList
                },
            })
                .then(response => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    resolve(response.data);
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error(error)
                    reject(error)
                });

        })
    },
    getAllCardsFromCustomerCollectionSection:()=>{
        return new Promise(async(resolve,reject) => {
            var CustomerListData;
            var CustomerListID;
            let Customer_CollectionSectionFound = false; // Flag to track if the office section is found

            try {
                AllLists = await module.exports.getAllList();
            } catch (error) {
                console.error(error);
            }

            for (let i = 0; i < AllLists.length; i++) {
                if (AllLists[i].name === "Customer Collection") {
                    CustomerListData = AllLists[i];
                    console.log("CustomerListData: ", CustomerListData);
                    CustomerListID = CustomerListData.id;
                    try {
                        var AllCards = await module.exports.getAllcardsFromCardID(CustomerListID);
                        console.log("All cards:", AllCards);
                        resolve(AllCards);
                    } catch (error) {
                        console.error(error);
                    }
                    Customer_CollectionSectionFound = true; // Set the flag to true if the office section is found
                    break;
                }
            }

            if (!Customer_CollectionSectionFound) {
                console.log("No 'READY FOR DISPATCH' list found.");
                resolve({ status: false });
            } 
        })
    }



}