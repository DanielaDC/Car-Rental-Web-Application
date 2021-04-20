'use strict';

const db = require('./db');

const Rental = require('./Rental');
const vehicleDao = require('./vehicle_dao');
const moment = require('moment');

function isFrequentCustomer(userID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) as nRentals' +
            ' FROM rentals' +
            ' WHERE userID = ?';
        db.all(sql, [userID], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                let count = rows[0].nRentals;
                if (count > 2)
                    resolve(true);
                else resolve(false);
            }
        });
    });
}

exports.getReport = function (startDate, endDate, category, userAge, nExtraDrivers, estimatedKilometers, extraInsurance, userID) {
    return new Promise(async (resolve, reject) => {
        let priceModifier = 1;
        
        if (userAge < 25) priceModifier *= 1.05;
        else if (userAge > 65) priceModifier *= 1.1;
        if (nExtraDrivers > 0) priceModifier *= 1.15;
        if (extraInsurance === true) priceModifier *= 1.20;
        if (estimatedKilometers < 50)
            priceModifier *= 0.95;
        else if (estimatedKilometers < 150)
            priceModifier *= 1;
        else priceModifier *= 1.05;

        // evaluate the number of available vehicles according to the criteria
        let nVehicles = await vehicleDao.countVehiclesByCategory(category);
        const [nAvailableVehicles, vehicleID] = await vehicleDao.countAvailableVehiclesByCategoryAndID(category, startDate, endDate);
        if (nAvailableVehicles === 0) resolve({ nAvailableVehicles: 0, price: 0, vehicleID: undefined });
        let percentageAvailableVehicles = nAvailableVehicles / nVehicles * 100;
        if (percentageAvailableVehicles <= 10)
            priceModifier *= 1.10;

        if (await isFrequentCustomer(userID)) priceModifier *= 0.90;
        //console.log(priceModifier);
        let price;
        let nDays = moment(endDate).diff(startDate, 'days') + 1;
        switch (category) {
            case 'A': price = 80 * nDays; break;
            case 'B': price = 70 * nDays; break;
            case 'C': price = 60 * nDays; break;
            case 'D': price = 50 * nDays; break;
            case 'E': price = 40 * nDays; break;
            default: reject(category + ': no such category.');
        }
        //console.log(priceModifier);
        // console.log(price);
        price = price * priceModifier;
        price = Math.fround(price); // 229.999999 -> 230

        resolve({ nAvailableVehicles, price, vehicleID });
    });
}

exports.add = function (userID, vehicleID, startDate, endDate, category, nExtraDrivers, estimatedKilometers, extraInsurance, price) {
    return new Promise((resolve, reject) => {
        startDate = moment(startDate).format("YYYY-MM-DD");
        endDate = moment(endDate).format("YYYY-MM-DD");

        const sql = 'INSERT INTO rentals(userID, vehicleID, startDate, endDate, vehicleCategory, nExtraDrivers, estimatedKilometers, extraInsurance, price) VALUES(?,?,?,?,?,?,?,?,?)';
        db.run(sql, [userID, vehicleID, startDate, endDate, category, nExtraDrivers, estimatedKilometers, extraInsurance ? 'true' : 'false', price], function (err) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(undefined);
            }
        });
    });
}

exports.delete = function (rentalID) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM rentals WHERE rentalID = ?';
        db.run(sql, [rentalID], (err) => {
            if (err)
                reject(err);
            else
                resolve(undefined);
        });
    });
}