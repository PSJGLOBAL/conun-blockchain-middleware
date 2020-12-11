const {User, validate} = require('../../models/profile/user');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');
const helper = require('../../app/helper')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send({error: error.details[0].message, status: 400});
    if (req.body.isAdmin)
        return res.status(400).send({error: '-', status: 400});
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).send({error: 'User already exist', status: 400});
    try {
        let wallet_address = req.body.wallet_address;
        let orgName = req.body.orgName;
        let name = req.body.name;
        let email = req.body.email;
        const csvWriter = createCsvWriter({
            path: __dirname+'wallet.csv',
            header: [
                {id: 'wallet_address'},
            ]
        });
        for (let i = 0; i < 100; i++) {
            await helper.getRegisteredUser(wallet_address.concat(`${i}`), orgName, true);
            user = new User ({
                name: name.concat(`${i}`),
                email: email.concat(`${i}`),
                orgName: orgName,
                password: req.body.password,
                wallet_address: wallet_address.concat(`${i}`),
                isAdmin:  req.body.isAdmin
            });

            let data = [
                {
                    wallet_address: wallet_address.concat(`${i}`),
                },
            ]

            csvWriter
                .writeRecords(data)
                .then(()=> console.log('The CSV file was written successfully'));

            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(user.password, salt);
            await user.save();
        }
        res.json({ success: true, message: 'success' }).status(200);
    } catch (e) {
        res.json({ success: false, message: 'error while user creation' }).status(400);
    }
});

module.exports = router;