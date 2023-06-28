const Mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    email: {
        type: String,
        require: true,
        unique: true,
        uniqueCaseInsensitive: true,
    },
    username: {
        type: String,
        require: true,
        unique: true,
        uniqueCaseInsensitive: true,
    },
});

UserSchema.plugin(uniqueValidator);

UserSchema.virtual('fullname').get(function () {
    return this.firstname + ' ' + this.lastname;
});

UserSchema.virtual('link').get(function () {
    return this.username + '.' + process.env.DOMAIN;
});

module.exports = Mongoose.model('User', UserSchema);