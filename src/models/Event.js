import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    totalTickets: {
      type: Number,
      required: true,
      min: 1
    },
    ticketsAvailable: {
      type: Number,
      required: true,
      min: 0
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });

eventSchema.index({ organizer: 1 });

export default mongoose.model("Event", eventSchema);
