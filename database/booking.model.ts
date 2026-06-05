import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import EventModel from './event.model';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingDocument extends IBooking, Document {}

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email requis'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
    },
  },
  { timestamps: true, strict: true }
);

// Index composite pour éviter double réservation même email/événement
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

BookingSchema.pre<BookingDocument>('save', async function () {
  const event = await EventModel.findById(this.eventId);
  if (!event) throw new Error('Événement introuvable');
  
  // ✅ FIX: Gestion capacité
  if ((event.bookingsCount ?? 0) >= (event.capacity ?? Infinity)) {
    throw new Error(`Événement complet (${event.capacity} places)`);
  }
});

// Incrémenter compteur après création réussie
BookingSchema.post<BookingDocument>('save', async function () {
  await EventModel.findByIdAndUpdate(this.eventId, { $inc: { bookingsCount: 1 } });
});

const BookingModel = (mongoose.models.Booking as Model<BookingDocument>) || 
                     mongoose.model<BookingDocument>('Booking', BookingSchema);
export default BookingModel;
