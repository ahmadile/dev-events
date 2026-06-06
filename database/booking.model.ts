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
  // Only reserve a slot when creating a new booking
  if (!this.isNew) return;

  const event = await EventModel.findById(this.eventId);
  if (!event) throw new Error('Événement introuvable');

  // Attempt atomic increment only if capacity allows
  const updated = await EventModel.findOneAndUpdate(
    { _id: this.eventId, bookingsCount: { $lt: event.capacity ?? Infinity } },
    { $inc: { bookingsCount: 1 } }
  );

  if (!updated) {
    throw new Error(`Événement complet (${event.capacity} places)`);
  }

  // Mark that a reservation was performed so we can rollback on error
  (this as any)._reserved = true as unknown as boolean;
});

// Success case: reservation already applied atomically; no post-save increment needed

// If save fails after the reservation (e.g., unique index violation), roll back the increment
BookingSchema.post('save', function (error: any, doc: any, next: any) {
  const bookingDoc = doc as BookingDocument | undefined;
  const reserved = bookingDoc ? (bookingDoc as any)._reserved : (this as any)._reserved;
  if (reserved && bookingDoc) {
    EventModel.findByIdAndUpdate(bookingDoc.eventId, { $inc: { bookingsCount: -1 } })
      .then(() => next(error))
      .catch(() => next(error));
  } else {
    next(error);
  }
});

const BookingModel = (mongoose.models.Booking as Model<BookingDocument>) || 
                     mongoose.model<BookingDocument>('Booking', BookingSchema);
export default BookingModel;
