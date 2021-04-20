'use strict';

//import express
const express = require('express');
const rentalDao = require('./rental_dao');
const userDao = require('./user_dao');
const vehicleDao = require('./vehicle_dao');
const morgan = require('morgan'); // logging middleware
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 3000; //seconds
// Authorization error
const authErrorObj = { errors: [{  'param': 'Server', 'msg': 'Authorization error' }] };

//create application
const app = express();
const port = 3001;

// Set-up logging
app.use(morgan('tiny'));

// Process body content
app.use(express.json());

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // TESTATO
    userDao.getUserByEmail(email)
      .then((user) => {

        if(user === undefined) {
            res.status(404).send({
                errors: [{ 'param': 'Server', 'msg': 'Invalid e-mail' }] 
              });
        } else {
            if(!userDao.checkPassword(user, password)){
                res.status(401).send({
                    errors: [{ 'param': 'Server', 'msg': 'Wrong password' }] 
                  });
            } else {
                //AUTHENTICATION SUCCESS
                const token = jsonwebtoken.sign({ userID: user.userID }, jwtSecret, {expiresIn: expireTime});
                res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000*expireTime });
                res.json({userID: user.userID, name: user.name});
            }
        } 
      }).catch(

        // Delay response when wrong user/pass is sent to avoid fast guessing attempts
        (err) => {
            new Promise((resolve) => {setTimeout(resolve, 1000)}).then(() => res.status(401).json(authErrorObj))
        }
      );
  });

app.use(cookieParser());

app.post('/api/logout', (req, res) => {
    res.clearCookie('token').end();
});


//GET /vehicles TESTATO
app.get('/api/vehicles', (req, res) => {
    vehicleDao.getVehicles(req.query.filtersByBrand, req.query.filtersByCategory)
        .then((vehicles) => {
            res.json(vehicles);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

//GET /brands TESTATO
app.get('/api/brands', (req, res) => {
    vehicleDao.getBrands()
        .then((brands) => {
            res.json(brands);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

// For the rest of the code, all APIs require authentication
app.use(
    jwt({
      secret: jwtSecret,
      getToken: req => req.cookies.token
    })
  );
  
// To return a better object in case of errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json(authErrorObj);
    }
  });

// AUTHENTICATED REST API endpoints

//GET /user/profile TESTATO
app.get('/api/user/profile', (req,res) => {
    const userID = req.user && req.user.userID;
    userDao.getUserById(userID)
        .then((user) => {
            res.json(user);
        }).catch(
        (err) => {
         res.status(401).json(err);
        }
      );
});

//GET /user/rentals
app.get('/api/user/rentals', (req,res) => {
    const userID = req.user && req.user.userID;
    let functionToCall;
    let which = req.query.which;
    if (!which.localeCompare('past')) functionToCall = userDao.getPastRentalsByUserID;
    else if (!which.localeCompare('future')) functionToCall = userDao.getFutureRentalsByUserID;
    else res.status(401).json(err);
    functionToCall(userID)
        .then((rentals) => {
            res.json(rentals);
        }).catch(
        (err) => {
         res.status(401).json(err);
        }
      );
});

//GET // TESTATO
app.get('/api/getReport', async (req, res) => {
    const userID = req.user && req.user.userID;
    const userAge = await userDao.getAgeByID(userID);
   // getReport returns an object: {nVehicles, price, vehicleID}
    rentalDao.getReport(req.query.startDate,req.query.endDate,req.query.category,userAge,req.query.nExtraDrivers,req.query.estimatedKilometers,!req.query.extraInsurance.localeCompare("true") ? true:false, userID)
        .then((report) => {
            res.json(report);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

//POST //TESTATO
app.post('/api/setReport', (req, res) => {
    const userID = req.user && req.user.userID;
    let report = req.body;
    rentalDao.add(userID, report.vehicleID, report.startDate, report.endDate, report.category, report.nExtraDrivers, report.estimatedKilometers, report.extraInsurance, report.price)
        .then(() => {
            res.status(200).send();
        })
        // Since this is a stub API, no error can occur
        .catch((err) => {
            res.status(500).json({
                errors: [{'param': 'Server', 'msg': err}],
            });
        });
});

//DELETE // TESTATO
app.delete('/api/user/rentals/:rentalID', (req,res) => {
    rentalDao.delete(req.params.rentalID)
        .then(() => res.status(200).end())
        .catch((err) => res.status(500).json({
            errors: [{'param': 'Server', 'msg': err}],
        }));
});

// Payment checker, just return ok..
app.post('/api/pay', (req,res) => {
    res.status(200).end();
});

//activate server
app.listen(port, () => console.log('Server ready: ' + port));