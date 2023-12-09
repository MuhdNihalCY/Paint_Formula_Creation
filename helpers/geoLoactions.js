var express = require('express');
var { SuperfaceClient } = require('@superfaceai/one-sdk');

const IPData = require('ipdata').default;

const sdk = new SuperfaceClient();

module.exports = {
    FindGeo: (ip) => {
        return new Promise(async (resolve, reject) => {
            const profile = await sdk.getProfile("address/ip-geolocation@1.0.1");

            // Use the profile
            const result = await profile.getUseCase("IpGeolocation").perform(
                {
                    ipAddress: ip
                },
                {
                    provider: "ipdata",
                    security: {
                        apikey: {
                            apikey: "9639de4c3f7b6ac2a7dcda31ccb281518ead69be5789c5be2219d50a" //mine

                            // apikey: "9a511b6fc8334e1852cfbbd4ff3f1af3c42ed6abc75e96a1648b969a"
                        }
                    }
                }
            );

            // Handle the result
            try {
                const data = result.unwrap();
                resolve(data);
            } catch (error) {
                console.error(error);
            }
        })
    },
    FindGeoUseIPData: (ip) => {
        return new Promise(async (resolve, reject) => {
            const ipdata = new IPData('9639de4c3f7b6ac2a7dcda31ccb281518ead69be5789c5be2219d50a');
           // const ip = '1.1.1.1';
            ipdata.lookup(ip)
                .then(function (data) {
                    console.log(data);
                });
        })
    }
}


