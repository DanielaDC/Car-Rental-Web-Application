class Vehicle{    

    constructor(category, brand, model) {
        
        this.category = category;
        this.brand = brand;
        this.model = model;
    }

    /**
     * Construct a Task from a plain object
     * @param {{}} json 
     * @return {Vehicle} the newly created Task object
     */
    static from(json) {
        const t =  Object.assign(new Vehicle(), json);
        return t;
    }

}

export default Vehicle;

