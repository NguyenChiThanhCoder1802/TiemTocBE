import mongoose from "mongoose";
const StaffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    salary: {
      type: Number,
      default: 0
    },

    experienceYears: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    skills: [{
      type: String
    }],

    position: {
      type: String,
      enum: ['stylist', 'assistant', 'manager'],
      default: 'stylist'
    },

    workingStatus: {
      type: String,
      enum: ['active', 'off', 'resigned'],
      default: 'active'
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    ratingCount: {
      type: Number,
      default: 0
    },

    completedBookings: {
      type: Number,
      default: 0
    },
    joinedAt: Date,
    note: String
  },
  { timestamps: true }
);

export default mongoose.model("Staff", StaffSchema);