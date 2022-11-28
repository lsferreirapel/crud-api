export type Role = "USER" | "ADMIN";

export interface Base {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface User extends Base {
  avatar: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  password: string;
  document: string;
  role: Role;
  active: boolean;
  confirmation_hash: string;
}

export interface Product extends Base {
  name: string;
  quantityInStock: number;
  price: number;
  image: string;
  description: string;
  owner_id: User["id"];
}

export interface Rating extends Base {
  value: number;
  user_id: number;
  product_id: number;
}
