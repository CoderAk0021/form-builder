import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    }
})

const Admin = mongoose.model('Admin',adminSchema);
export default Admin;
