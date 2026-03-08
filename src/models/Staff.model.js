import mongoose from "mongoose";
const StaffSchema = new mongoose.Schema(
  {
    name: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  email: {
    type: String,
    trim: true
  },

  avatar: {
    type: String,
    default: ""
  },
    salary: {
      type: Number,
      default: 0
    },

    experienceYears: {
      type: Number,
      default: 0
    },

    position: {
      type: String,
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
    joinedAt: {
    type: Date,
    default: Date.now
  },
    note: String
  },
  { timestamps: true }
);

export default mongoose.model("Staff", StaffSchema);