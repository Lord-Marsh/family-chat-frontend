export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}