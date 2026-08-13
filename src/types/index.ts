export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  upiId?: string;
  userType: 'a' | 'sa';
}

export interface Split {
  _id: string;
  description: string;
  totalAmount: number;
  category: string;
  paidBy: { userId: string; amount: number; displayName?: string }[];
  splitAmong: { userId: string; share: number; displayName?: string }[];
  settlements: Settlement[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'settled';
  splitType: 'equal' | 'custom';
}

export interface Settlement {
  id: string;
  fromUserId: string;
  fromDisplayName?: string;
  toUserId: string;
  toDisplayName?: string;
  toUserUpiId?: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt: string | null;
  note: string;
  markedBy: string | null;
  markedAt: string | null;
}

export interface Balance {
  fromUser: string;
  toUser: string;
  amount: number;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
}

export interface LogEntry {
  _id: string;
  userId?: string;
  action?: string;
  details?: string;
  ip?: string;
  time: string;
  [key: string]: any;
}