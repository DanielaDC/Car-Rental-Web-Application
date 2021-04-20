class Rental{    
    constructor(rentalID, userID, vehicleID, startDate, endDate, vehicleCategory, nExtraDrivers, estimatedKilometers, extraInsurance, price) {
        
        this.rentalID = rentalID;

        this.userID = userID;
        this.vehicleID = vehicleID;
        this.startDate = startDate;
        this.endDate = endDate;
        this.vehicleCategory = vehicleCategory;
        this.nExtraDrivers = nExtraDrivers;
        this.estimatedKilometers = estimatedKilometers;
        this.extraInsurance = extraInsurance;
        this.price = price;
    }
}

module.exports = Rental;