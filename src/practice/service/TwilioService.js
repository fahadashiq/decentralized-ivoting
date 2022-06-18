const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const HttpStatus = require("http-status-codes");
const serviceId = "VA0a2edad3cb59d5ba2a5305f058532c08";

const client = require('twilio')(accountSid, authToken);

class TwilioService {

    sendSms(phoneNumber, request, response, successCallback) {
        client
            .verify
            .services(serviceId)
            .verifications
            .create({
                to: phoneNumber, channel: 'sms'
            })
            .then(data => {
               console.log(data);
                successCallback(request, response)
            }).catch( err => {
            console.log(err);
            response.status(HttpStatus.BAD_REQUEST).send({ "error": "Can't send OTP. Please try again later."});
        });
    }

    verifyOtp(request, response, successCallback, phoneNumber) {
        client
            .verify
            .services(serviceId)
            .verificationChecks
            .create({
                to: phoneNumber,
                code: request.body.otp
            })
            .then(data => {
                console.log(data);
                if (data.status === "approved") {
                    successCallback(request, response);
                }else {
                    response.status(HttpStatus.BAD_REQUEST).send("Invalid OTP");
                }
            }).catch( err => {
                console.log(err);
            response.status(HttpStatus.BAD_REQUEST).send({ "error": "OTP Auth failed. Please request OTP again."});
        });
    }

}
module.exports = TwilioService;

