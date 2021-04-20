import Vehicle from './Vehicle';
const baseURL = "/api";


async function isAuthenticated() {
    let url = "/user/profile";
    const response = await fetch(baseURL + url);
    const userJson = await response.json();
    if (response.ok) {
        return userJson;
    } else {
        let err = { status: response.status, errObj: userJson };
        throw err;  // An object with the error coming from the server
    }
}

const profile = isAuthenticated;

async function getVehicles(filtersByCategory, filtersByBrand) {
    let url = "/vehicles";
    let urlfinal;
    //console.log(filtersByCategory + filtersByBrand);
    let filtersByCategoryString = "", filtersByBrandString = "";
    if (filtersByCategory.length > 1)
        filtersByCategoryString = filtersByCategory.reduce((previous, current) => previous + ',' + current);
    else if (filtersByCategory.length == 1)
        filtersByCategoryString = filtersByCategory[0];
    if (filtersByBrand.length > 1)
        filtersByBrandString = filtersByBrand.reduce((previous, current) => previous + ',' + current);
    else if (filtersByBrand.length == 1)
        filtersByBrandString = filtersByBrand[0];

    if (filtersByBrandString == undefined && filtersByCategoryString == undefined)
        urlfinal = "";
    else if (filtersByBrandString != undefined && filtersByCategoryString == undefined)
        urlfinal = "?filtersByBrand=" + filtersByBrandString;
    else if (filtersByBrandString == undefined && filtersByCategoryString != undefined)
        urlfinal = "?filtersByCategory=" + filtersByCategoryString;
    else urlfinal = "?filtersByCategory=" + filtersByCategoryString + "&filtersByBrand=" + filtersByBrandString;

    urlfinal = url + urlfinal;
    //let example = "?filtersByCategory=A,B&filtersByBrand=Mercedes-Benz,Audi"


    const response = await fetch(baseURL + urlfinal);
    let vehiclesJson;
    try {
        vehiclesJson = await response.json();
    } catch (err) {
        // the object is empty
        return [];
    }
    if (response.ok) {
        return vehiclesJson.sort(function (a, b) {
            if (a.category < b.category)
                return -1;
            if (a.category > b.category)
                return 1;
            return 0;
        }).map((v) => new Vehicle(v.category, v.brand, v.model));
    } else {
        let err = { status: response.status, errObj: vehiclesJson };
        throw err;  // An object with the error coming from the server
    }
}

async function getBrands() {
    let url = "/brands";

    const response = await fetch(baseURL + url);
    const brandsJson = await response.json();
    if (response.ok) {
        //console.log(brandsJson);
        return brandsJson.sort(function (a, b) {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        }); // Vector of string of brands
    } else {
        let err = { status: response.status, errObj: brandsJson };
        throw err;  // An object with the error coming from the server
    }
}

async function login(email, password) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password }),
        }).then((response) => {
            if (response.ok) {
                response.json().then((user) => {
                    resolve(user);
                });
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function logout() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/logout', {
            method: 'POST',
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        });
    });
}

async function getReport(startDate, endDate, category, nExtraDrivers, estimatedKilometers, extraInsurance) { // Devo aggiungere tutti i parametri, dal quale creo il link
    let url = "/getReport";
    let startDateFilter = "?startDate=" + startDate;
    let endDateFilter = "&endDate=" + endDate;
    let categoryFilter = "&category=" + category;
    let nExtraDriversFilter = "&nExtraDrivers=" + nExtraDrivers;
    let estimatedKilometersFilter = "&estimatedKilometers=" + estimatedKilometers;
    let extraInsuranceFilter = "&extraInsurance=" + extraInsurance;

    let urlfinal = url + startDateFilter + endDateFilter + categoryFilter + nExtraDriversFilter + estimatedKilometersFilter + extraInsuranceFilter;
    // getReport?startDate=2020-02-01&endDate=2020-02-09&category=B&nExtraDrivers=0&estimatedKilometers=60.0&extraInsurance=false
    const response = await fetch(baseURL + urlfinal);
    const vehiclesJson = await response.json();
    if (response.ok) {
        return vehiclesJson;
    } else {
        let err = { status: response.status, errObj: vehiclesJson };
        throw err;  // An object with the error coming from the server
    }
}

async function pay(vehicleID, startDate, endDate, category, nExtraDrivers, estimatedKilometers, extraInsurance, price, cardNumber, CVV) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/pay", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cardNumber,
                CVV
            }),
        }).then((response) => {
            if (response.ok) { // Should be always ok..
                resolve(null);
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors

        // NOW we set the rental
        fetch(baseURL + "/setReport", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vehicleID,
                startDate,
                endDate,
                category,
                nExtraDrivers,
                estimatedKilometers,
                extraInsurance,
                price
            })
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function rentals(which) {
    let url = "/user/rentals?which=" + which; // which is "past" or "future"

    const response = await fetch(baseURL + url);
    let rentalsJson
    try{rentalsJson =await response.json()}
    catch (error){return []}

    if (response.ok) {
        //return tasksJson.map((t) => Task.from(t));
        return rentalsJson; // Array of vehicle
    } else {
        let err = { status: response.status, errObj: rentalsJson };
        throw err;  // An object with the error coming from the server
    }
}

async function deleteRental(rentalID) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/user/rentals/" + rentalID, {
            method: 'DELETE'
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

const API = { isAuthenticated, profile, getVehicles, getBrands, login, logout, getReport, rentals, deleteRental, pay };
export default API;