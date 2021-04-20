class RentalDto {    
    constructor(rentalID, startDate, endDate, category, nExtraDrivers, estimatedKilometers, extraInsurance, price) {
        
        this.rentalID = rentalID;

        this.startDate = startDate;
        this.endDate = endDate;
        this.category = category;
        this.nExtraDrivers = nExtraDrivers;
        this.estimatedKilometers = estimatedKilometers;
        this.extraInsurance = extraInsurance;
        this.price = price;
    }
}

module.exports = RentalDto;