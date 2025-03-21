import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLenght: 6,
  },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  isSuperUser: { type: Boolean, default: false },
  booktaken: {
    type: String,
    required: false,
  },
  loan_date: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
