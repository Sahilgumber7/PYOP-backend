import Event from '../models/Event';
import User  from '../models/User';
import Category from '../models/Category';

/** Pass a Mongoose query, get it populated the same way you did in Next.js */
export const populateEvent = (query: any) =>
  query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category',  model: Category, select: '_id name' });
