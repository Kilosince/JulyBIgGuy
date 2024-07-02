
import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    imagePath:{type: String,required:true},
    title:{type: String, required:true},
    description:{type: String, required:true},
    price:{type: Number, required:true},
    available_quantity:{type: Number, required:true},
    notes:{type: String, required:false}
  }, {
    timestamps: true,
});

const MenuModel = mongoose.model('Menu', menuSchema);

module.exports = MenuModel;