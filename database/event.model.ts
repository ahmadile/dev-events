// FILE: database/event.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // YYYY-MM-DD UTC
  time: string; // HH:MM 24h
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  capacity?: number; // Ajout pour gestion réservation
  bookingsCount?: number; // Compteur optimisé
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventDocument extends IEvent, Document {}

const NonEmptyString = {
  type: String,
  required: [true, 'Ce champ est obligatoire'],
  trim: true,
  minlength: [2, 'Minimum 2 caractères'],
};

const EventSchema = new Schema<EventDocument>(
  {
    title: NonEmptyString,
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: NonEmptyString,
    overview: NonEmptyString,
    image: { ...NonEmptyString, match: [/^https?:\/\//, 'URL invalide'] },
    venue: NonEmptyString,
    location: NonEmptyString,
    date: { type: String, required: true },
    time: { type: String, required: true, match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM requis'] },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
    audience: NonEmptyString,
    agenda: { type: [String], required: true, validate: [(a: string[]) => a.length > 0, 'Au moins un point'] },
    organizer: NonEmptyString,
    tags: { type: [String], required: true, validate: [(t: string[]) => t.length > 0, 'Au moins un tag'] },
    capacity: { type: Number, min: 1, default: 100 },
    bookingsCount: { type: Number, default: 0 },
  },
  { timestamps: true, strict: true }
);

// Indexes performants
EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ date: 1, mode: 1 }); // Pour filtrage liste événements

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ✅ FIX: Normalisation UTC stricte pour éviter les décalages
function normalizeDate(input: string): string {
  const parsed = new Date(input + 'T00:00:00Z');
  if (Number.isNaN(parsed.getTime())) throw new Error(`Date invalide: ${input}`);
  return parsed.toISOString().slice(0, 10);
}

function normalizeTime(input: string): string {
  const trimmed = input.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let h = Number(ampmMatch[1]);
    const m = ampmMatch[2];
    const ampm = ampmMatch[3].toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const match = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) throw new Error(`Format temps invalide: ${input}. Attendu: HH:MM`);
  return `${match[1]}:${match[2]}`;
}

EventSchema.pre<EventDocument>('save', async function () {
  if (this.isModified('title')) {
    const base = slugify(this.title);
    let candidate = base;
    let suffix = 0;
    const EventModel = this.constructor as Model<EventDocument>;
    while (await EventModel.exists({ slug: candidate, _id: { $ne: this._id } })) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    this.slug = candidate;
  }
  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
});

const EventModel = (mongoose.models.Event as Model<EventDocument>) || 
                   mongoose.model<EventDocument>('Event', EventSchema);
export default EventModel;