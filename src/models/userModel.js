import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{type:String, required: true},
    email:{type:String, required: true, unique:true},
    password:{type:String, required: true},
    role: {
    type: String,
    enum: ["admin", "editor","user"], // allowed values
    default: "user", // default role
    },
    verifyotp:{type:String, default: '',max: 6},
    verifyotpExpireAt:{type:Number, default: 0},
    isAccountVerified:{type:Boolean, default: false},
    resetOtp:{type:String,default:''},
    resetOtpExpireAt:{type:Number,default:0},
})

const userModel = mongoose.model('User', userSchema);

export default userModel;