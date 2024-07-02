const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    kind: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        max: 255,
        min: 6
    },
    password: {
        type: String,
        required: true,
        trim: true,
        max: 1024,
        min: 6
    },
    store: {
        name: String,
        items: [{
            title: String,
            price: Number,
            quantity: Number,
            description: String
        }]
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
