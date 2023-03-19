import express from 'express';

import {getUserByEmail, createUser} from '../models/user';
import {authentication, random} from '../helpers/index';

// user login
export const login = async (req: express.Request, res: express.Response) => {
    const {email, password} = req.body;
    try {
        if(!email || !password) {
            return res.status(400).json({error: 'Missing email or password'});
        }

        const user = await getUserByEmail(email).select('+authentication.password +authentication.salt');
        if(!user) {
            throw new Error('User not found');
        }

        const expectedHash = authentication(user.authentication!.salt!, password);

        if(expectedHash !== user.authentication!.password) {
            throw new Error('Invalid password');
        }

        const salt = random();
        user.authentication!.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('sessionToken', user.authentication!.sessionToken, {domain: 'localhost',httpOnly: true});

        return res.status(200).json({message: 'Login successful', user: user.toObject()});
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({error: error.message});
    }
}

// user register
export const register = async (req: express.Request, res: express.Response) => {
    const {email, username, password} = req.body;
    try {
        if(!email || !username || !password) {
            return res.status(400).json({error: 'Missing email, username or password'});
        }

        const user = await getUserByEmail(email);
        if(user) {
            throw new Error('User already exists');
        }

        const salt = random();
        const passwordHash = authentication(salt, password);

        const newUser = await createUser({
            email,
            username,
            authentication: {
                password: passwordHash,
                salt
            }
        });

        res.status(200).json({message: 'Register successful', user: newUser});
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({error: error.message});
    }
}