import { User } from './user';

export interface MessageModel {
  from?: User,
  to?: User,
  recentMessage?: string,
  messages?: [{
    from?: string,
    to?: string,
    messageType: number,
    tripId?: any,
    bookingId?: string,
    isBookingClosed?: boolean, 
    isMessageFromSchool?: boolean,
    message?: string,
    isReply?: string,
    status?: string,
    createdAt?: Date,
    updatedAt?: any
  }]
}