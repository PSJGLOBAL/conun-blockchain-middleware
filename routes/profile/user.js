const {User, validate} = require('../../models/profile/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const helper = require('../../app/helper');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * definitions:
 *   userSchema:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       orgName:
 *         type: string
 *       password:
 *         type: string
 *       wallet_address:
 *         type: string
 *       isAdmin:
 *         type: boolean
 */


/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - usersRoute
 *     description: Returns current user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get single user
 *         schema:
 *           $ref: '#/definitions/userSchema'
 */

router.get('/me', auth, async (req, res) => {
    try {
        console.log('me >>  ');
        const user = await User.findById(req.user._id).select('-password');
        console.log('>> user', user)
        res.send(user);
    } catch (e) {
        console.log('me err: ', e)
    }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Puppies
 *     description: check if user exist
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of puppies
 *         schema:
 *           $ref: '#/definitions/userSchema'
 */

router.get('/', auth, async (req, res) => {
    const user = await User.find();
    res.send(user);
});


/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags:
 *       - usersRoute
 *     description: Creates a new puppy
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: puppy
 *         description: Puppy object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/userSchema'
 *     responses:
 *       200:
 *         description: Successfully created
 */

router.post('/', async (req, res) => {
    console.log('req body: ', req.body)
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

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            wallet_address: wallet_address,
            isAdmin:  req.body.isAdmin
        });
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        await user.save()
        let response = await helper.getRegisteredUser(wallet_address, orgName, true);

        if (typeof response !== 'string') {
            res.send( _.pick(user, ['_id', 'name', 'email', 'wallet_address'])).status(201);
        } else {
            res.json({ success: false, message: response }).status(400);
        }
    } catch (e) {
        res.json({ success: false, message: 'error while user creation in blockchain network' }).status(400);
    }
});

module.exports = router;