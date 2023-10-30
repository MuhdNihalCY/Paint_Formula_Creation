const axios = require('axios');
const accountSid = 'ACb08be145ac36f2969017160d4c518971';
const authToken = 'c0ae95489719bb3962e715ae1d1701ab';
const client = require('twilio')(accountSid, authToken);

module.exports = {
    sendTestMessage: () => {
        return new Promise(async (resolve, reject) => {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            // const client = require('twilio')(accountSid, authToken);
            var OrderID = '23-25-878-SampleName'
            var DeliveryTO = "MR. Office"
            var Items =    `*FT 34912 VIC - 1 ltr,   2K 10% gloss clear - 1 ltr,   MS 25 - 500ml,  142 - 1 can*`;

            var Message = `Your ordered items (Order ID: ${OrderID})\nitems:\n${Items}\nIs delivered to store - ${DeliveryTO}`;

            client.messages
                .create({
                    from: 'whatsapp:+971528704255',
                    body: Message,
                    to: 'whatsapp:+918891303280'
                })
                .then(message => {
                    console.log(message);
                    resolve(message.sid);
                })
        });
    },
};
