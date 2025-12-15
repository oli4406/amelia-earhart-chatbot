/**
 * Mongoose User model.
 * Stores user credentials and profile information.
 * @module models/user
 * @typedef {Object} User
 * @property {string} email
 * @property {string} passwordHash
 * @property {string} firstName
 * @property {string} lastName
 */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
