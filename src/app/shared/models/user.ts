export interface User {
  recentMessageTime?: any;
  _id?: string,
  firstName?: string,
  lastName?: string,
  avatar?: any,
  email?: string,
  mobile?: string,
  dob?: Date,
  type?: number,
  address?: string,
  recentMessage?: string,
  unreadMsgCount?: number,
  latestMessageTime?: Date,
  createdAt?: Date;
  status?: number,
  permission?: number,
  loginType?: number,
  photoUrl?: string
}