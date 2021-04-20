'use strict';

const User = require('./User');
const db = require('./db');
const bcrypt = require('bcrypt');
const UserDto = require('./UserDto.js');
const RentalDto = require('./RentalDto');
const moment = require('moment');

exports.getUserByEmail = function (email) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE email = ?"
        db.all(sql, [email], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                const user = new User(rows[0].userID, rows[0].name, rows[0].email, rows[0].hash, rows[0].age);
                resolve(user);
            }
        });
    });
};

exports.checkPassword = function (user, password) {
    console.log("hash of: " + password);
    let hash = bcrypt.hashSync(password, 10);
    console.log(hash);
    console.log("DONE");

    return bcrypt.compareSync(password, user.hash);
}

exports.getPastRentalsByUserID = function (userID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT rentalID, startDate, endDate, vehicleCategory, nExtraDrivers, estimatedKilometers, extraInsurance, price FROM rentals' +
            ' WHERE userID = ? AND endDate < ?';
        db.all(sql, [userID, moment().format('YYYY-MM-DD')], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                const rentals = rows.map(row => new RentalDto(row.rentalID, row.startDate, row.endDate, row.vehicleCategory, row.nExtraDrivers, row.estimatedKilometers, !row.extraInsurance.localeCompare('true') ? true : false, row.price));
                resolve(rentals);
            }
        });
    });
};

exports.getFutureRentalsByUserID = function (userID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT rentalID, startDate, endDate, vehicleCategory, nExtraDrivers, estimatedKilometers, extraInsurance, price FROM rentals' +
            ' WHERE userID = ? AND endDate >= ?';
        db.all(sql, [userID, moment().format('YYYY-MM-DD')], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                const rentals = rows.map(row => new RentalDto(row.rentalID, row.startDate, row.endDate, row.vehicleCategory, row.nExtraDrivers, row.estimatedKilometers, !row.extraInsurance.localeCompare('true') ? true : false, row.price));
                resolve(rentals);
            }
        });
    });
};

exports.getUserById = function (id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE userID = ?"
        db.all(sql, [id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                let row = rows[0];
                const user = new UserDto(row.name, row.email, row.age);
                resolve(user);
            }
        });
    });
};

exports.getAgeByID = function (id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE userID = ?"
        db.all(sql, [id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                let row = rows[0];
                resolve(row.age);
            }
        });
    });
};