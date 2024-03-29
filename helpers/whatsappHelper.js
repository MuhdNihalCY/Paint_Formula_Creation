const axios = require('axios');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

module.exports = {
    sendDeliveyMessage: (cardData, Location) => {
        // return new Promise(async (resolve, reject) => {
        //     console.log("Whatsapp messageing  service is called");
        //     console.log("Only available after third phase completed.")
        //     console.log("cardData: ", cardData)
        //     console.log("Location: ", Location)

        //     resolve();
        // })
        return new Promise(async (resolve, reject) => {

            if (cardData && Location) {
                var OrderID = cardData.Name;
                var DeliveryTO = Location;
                var ContactDetails = cardData.ContactDetails;

                var ClientWhatsappNumber = `${cardData.WhatsAppcountrySelect}${cardData.WhatsappNumber}`;

                var checkItems = cardData.CheckListItems.checkItems;
                var itemsForMessage = ' ';

                if (cardData.ReadyProducts.length > 0) {
                    cardData.ReadyProducts.forEach((EachItem, index) => {
                        itemsForMessage += EachItem.Name
                        if (index < cardData.ReadyProducts.length - 1) {
                            itemsForMessage += ", ";
                        }
                    })
                }


                if (checkItems.length > 0) {
                    itemsForMessage = '';
                    checkItems.forEach((EachItem, index) => {
                        itemsForMessage += EachItem.Name;
                        if (index < checkItems.length - 1) {
                            itemsForMessage += ", ";
                        }
                    });
                }



                var Message = `Your ordered items (Order ID: *${OrderID}*)\n*${itemsForMessage}*\nIs delivered to ${DeliveryTO}`;
                //var Message = `Your ordered items (Order ID: *213123*)\n*3dfgdfg dsf asdfasd*\nIs delivered to bla`;

                console.log("ClientWhatsappNumber:", ClientWhatsappNumber);
                console.log("Message:", Message);


                // client.messages
                //     .create({
                //         from: 'whatsapp:+971528704255',
                //         body: Message,
                //         to: `whatsapp:+918891303280` //`whatsapp:${ClientWhatsappNumber}`
                //     })
                //     .then(message => {
                //         console.log(message);
                //         resolve(message.sid);
                //     })

            } else {
                var Err = { Error: "no Card data or no Contact data" };
                console.log(Err);
                resolve(Err);
            }



        })
    },
    SendTestMessage: () => {
        return new Promise((resolve, reject) => {
            var ClientWhatsappNumber = "+918891303280"
            var Message = `Your ordered items (Order ID: *SampleOrderID*)\n*Sample Items*\nIs delivered to you location`;
            client.messages
                .create({
                    from: 'whatsapp:+971528704255',
                    body: Message,
                    to: `whatsapp:${ClientWhatsappNumber}`
                })
                .then(message => {
                    console.log(message);
                    resolve(message.sid);
                })
        })
    }
};
