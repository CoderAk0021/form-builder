import mongoose from "mongoose";

const TestUserSchema = new mongoose.Schema({
  googleSub: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: "" },
  picture: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
});

const TestUser = mongoose.model("TestUser", TestUserSchema);

export default TestUser;
