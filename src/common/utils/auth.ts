import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../constants";
import jwt from "jsonwebtoken";
import { Role } from "../../types";

export type JWTPayload = {
  id: number;
  role: Role;
};

const jwtKey = process.env.JWT_KEY ?? "secret123";

export function encodePassword(password: string) {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

export function generateToken(payload: JWTPayload) {
  return jwt.sign(payload, jwtKey, {
    expiresIn: "1h",
  });
}

export function decodeToken(token: string): JWTPayload {
  const payload = jwt.verify(token, jwtKey);

  return payload as JWTPayload;
}
