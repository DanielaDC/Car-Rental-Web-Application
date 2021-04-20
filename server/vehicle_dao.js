'use strict';
const db = require('./db');
const VehicleDto = require('./VehicleDto');

exports.getVehicles = function (filtersByBrand, filtersByCategory) {
    return new Promise((resolve, reject) => {
        let filtersByBrandToDb;
        let filtersByCategoryToDb;
        let whereClause = '';
        if (filtersByBrand) {
            filtersByBrandToDb = filtersByBrand.split(',').map((filter, i) => {
                if (i === 0)
                    return 'brand = \'' + filter + '\'';
                else return ' OR brand = \'' + filter + '\'';
            })
                .reduce((previousValue, currentValue, currentIndex) => {
                    if (currentIndex === 0)
                        return currentValue;
                    else return previousValue.concat(currentValue);
                });
        }


        if (filtersByCategory) {
            filtersByCategoryToDb = filtersByCategory.split(',').map((filter, i) => {
                if (i === 0)
                    return 'category = \'' + filter + '\'';
                else return ' OR category = \'' + filter + '\'';
            })
                .reduce((previousValue, currentValue, currentIndex) => {
                    if (currentIndex === 0)
                        return currentValue;
                    else return previousValue.concat(currentValue);
                });
        }
        if (filtersByCategory && filtersByBrand)
            whereClause += ' WHERE (' + filtersByBrandToDb + ')' + ' AND ' + '(' + filtersByCategoryToDb + ')';
        else if (filtersByCategory)
            whereClause += ' WHERE (' + filtersByCategoryToDb + ')';
        else if (filtersByBrand)
            whereClause += ' WHERE (' + filtersByBrandToDb + ')';
        const sql = 'SELECT * FROM vehicles' + whereClause;
        console.log(sql);
        db.all(sql, (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                const vehicles = rows.map(row => new VehicleDto(row.category, row.brand, row.model));
                resolve(vehicles);
            }
        });
    });
};

exports.countVehiclesByCategory = function (category) {
    return new Promise((resolve, reject) => {
        const nVehiclesSql = 'SELECT COUNT(*) as nVehicles' +
        ' FROM vehicles' +
        ' WHERE category=?';
        db.all(nVehiclesSql, [category], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                resolve(rows[0].nVehicles);
            }
        });
    });
}



exports.countAvailableVehiclesByCategoryAndID = function (category, startDateUser, endDateUser) {
    return new Promise((resolve, reject) => {
        const nAvailableVehiclesSql = 'SELECT COUNT(*) as count, MIN(vehicleID) as vehicleID' +
        ' FROM vehicles' +
        ' WHERE category=?' +
        ' AND vehicleID NOT IN (SELECT vehicleID' +
        ' FROM rentals' +
        ' WHERE category=? AND (? <= endDate AND ? >= startDate))';
        db.all(nAvailableVehiclesSql, [category, category, startDateUser, endDateUser], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                resolve([rows[0].count, rows[0].vehicleID]);
            }
        });
    });
}

exports.getBrands = function () {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT DISTINCT brand' +
        ' FROM vehicles';
        db.all(sql, (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else {
                resolve(rows.map(row => row.brand));
            }
        });

    });
}