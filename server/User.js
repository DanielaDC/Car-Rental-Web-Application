class User{    
    constructor(id, name, email, hash, age) {

        this.userID = id;

        this.name = name;
        this.email = email;
        this.hash = hash;
        this.age = age;
    }
}

module.exports = User;