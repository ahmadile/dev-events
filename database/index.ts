import EventModel from './event.model';
import BookingModel from './booking.model';

export { EventModel, BookingModel };
export type { IEvent, EventDocument } from './event.model';
export type { IBooking, BookingDocument } from './booking.model';

const models = { EventModel, BookingModel };
export default models;
