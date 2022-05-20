const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    deletionComment: {
        type: String,
        default: "",
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}, {versionKey: false});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;