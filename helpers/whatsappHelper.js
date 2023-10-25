const axios = require('axios');
const accountSid = 'ACb08be145ac36f2969017160d4c518971';
const authToken = '892bb7f2a16d3ad5204194ced109b7fd';
const client = require('twilio')(accountSid, authToken);



module.exports = {
    sendTestMessage: () => {

        // text: {
        //     body: 'This is a custom text message without a template',
        //   },


        // Define your Facebook access token
        // const accessToken = 'EAABwpMpKX8sBOzDfZBA6nui13uq80qVuGjcyYk9jPld5FZBd4fJq3ZBhw3Pxn8YAb1wK6JLo11aOMQ1aDbTfJWpJfclsl1QeH9ZByaZCwbZAFLFGvoXusiZBAde7BJfRmE9ljA9zn0BeYfZBlemEILIC9h14mfZAHgfO2TUrPmeyADfF4viteXJrBCdTEcAR3ZCYE0ZAv80uuYwI62PGHpAk7o2kIIn7NncJ0uWGJUZD';

        // const requestData = {
        //     messaging_product: 'whatsapp',
        //     to: '919526853280',
        //     type: 'template',
        //     template: {
        //         name: 'hello_world',
        //         language: {
        //             code: 'en_us'
        //         }
        //     }
        // };

        // //134326953104684  134326953104684

        // //133857223148423

        // return new Promise((resolve, reject) => {
        //     axios.post('https://graph.facebook.com/v17.0/133857223148423/messages', requestData, {
        //         headers: {
        //             Authorization: `Bearer ${accessToken}`,
        //             'Content-Type': 'application/json',
        //         },
        //     })
        //         .then(response => {
        //             console.log(response.data);
        //             resolve(response.data);
        //         })
        //         .catch(error => {
        //             console.log("Error: ", error)
        //             reject(error);
        //         });
        // });






        client.messages
            .create({
                body: 'thank you',
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+918891303280'
            })
            .then(message => console.log(message.sid))
            // .done();
    },
};
