const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const HttpStatus = require('http-status-codes');
//import Campaign from '@prisma/client/index';
//var campaign = new Campaign();
class DatabaseClient {


    async addToDatabase(response) {
        campaign.name = "cap";
        campaign.code = "cap";
        const user = await prisma.campaign.create(campaign);

        // const user = await prisma.campaign.create({
        //     data: {
        //         name: 'camp-name',
        //         code: 'camp-code',
        //     },
        // });
        console.log(user);
        response.status(HttpStatus.OK).send({ "isAlive": true});
    }

    async addToDatabase(response) {
        const user = await prisma.campaign.create({
            data: {
                name: 'camp-name',
                code: 'camp-code',
            },
        });
        console.log(user);
        response.status(HttpStatus.OK).send({ "isAlive": true});
    }

}
module.exports = DatabaseClient;
