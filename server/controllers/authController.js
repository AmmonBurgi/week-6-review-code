//This controller handles all the authentication endpoints. For a more in depth overview of what these functions are doing, open the node-four-lecture-code repository and take a look at the comments.
const bcrypt = require('bcryptjs');

module.exports = {
    register: async(req, res) => {
        const {email, password, username} = req.body;
        const db = req.app.get('db');

        let user = await db.auth.check_user(email);
        if(user[0]){
            return res.status(400).send('Email already in use')
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);

        let newUser = await db.auth.register_user({email, password: hash, username});
        req.session.user = newUser[0];
        res.status(201).send(req.session.user);
    },
    login: async(req, res) => {
        const {email, password} = req.body;
        const db = req.app.get('db');

        let user = await db.auth.check_user(email);
        if(!user[0]){
            return res.status(400).send("User doesn't exist");
        }

        const authenticated = bcrypt.compareSync(password, user[0].password);
        if(!authenticated){
            return res.status(401).send('Password is incorrect');
        }

        delete user[0].password;
        req.session.user = user[0];
        res.status(202).send(req.session.user);
    },
    logout: (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    }
}