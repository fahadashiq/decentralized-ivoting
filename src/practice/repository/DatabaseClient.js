const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const HttpStatus = require('http-status-codes');
class DatabaseClient {

    addOrUpdateToken(token, userId, campaignCode, responseCallBack, errorCallback) {
        const addToken = (token, userId, campaignCode, responseCallBack, errorCallback) => {
          this.addToken(token, userId, campaignCode, responseCallBack, errorCallback);
        };

        const updateToken = (token, userId, campaignCode, responseCallBack, errorCallback) => {
            this.updateToken(token, userId, campaignCode, responseCallBack, errorCallback);
        }

        prisma.token.findFirst({
            where: {
                userId: userId,
                campaignCode: campaignCode
            }
        }).then(function (user) {
            if (user == null) {
                addToken(token, userId, campaignCode, responseCallBack, errorCallback);
            } else {
                updateToken(token, userId, campaignCode, responseCallBack, errorCallback);
            }
        }).catch(function (err) {
            errorCallback(err.message);
        });
    }

    addToken(token, userId, campaignCode, responseCallBack, errorCallback) {
        prisma.token.create({
            data: {
                token: token,
                userId: userId,
                campaignCode: campaignCode
            },
        }).then( function (user) {
            responseCallBack();
        }).catch(function (err) {
            errorCallback(err.message);
        });

    }

    updateToken(token, userId, campaignCode, responseCallBack, errorCallback) {
        prisma.token.update({
            where: {
                campaignCode_userId: {
                    userId: userId,
                    campaignCode: campaignCode
                }
            },
            data: {
                token: token
            },
        }).then( function (user) {
            responseCallBack();
        }).catch(function (err) {
            errorCallback(err.message);
        });

    }

    getToken(token, userId, campaignCode, voteCallback, errorCallback) {
        prisma.token.findFirst({
            where: {
                token: token,
                userId: userId,
                campaignCode: campaignCode
            }
        }).then( function (user) {
            console.log("user " );
            console.log(user);
            if (user == null) {
                errorCallback();
            }else {
                voteCallback();
            }
        }).catch(function (err) {
            errorCallback();
        });;
    }

}
module.exports = DatabaseClient;
