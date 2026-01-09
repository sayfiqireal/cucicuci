export interface TokenPayload {
  sub: number;
  id: number;
  email: string;
  role: 'user' | 'admin';
  name: string;
}
