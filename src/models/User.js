import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  username: { type: String, required: true, unique: true },
  //   socialOnly: { type: Boolean, default: false },
  password: { type: String },
  //   videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const user = mongoose.model("User", userSchema);
export default user;
