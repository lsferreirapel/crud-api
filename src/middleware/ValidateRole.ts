import { NextFunction, Request, Response } from "express";
import { httpErrors } from "../common/constants/httpMessages";
import { decodeToken } from "../common/utils/auth";
import knex from "../../db/db_config";
import { User } from "../types";

export async function validateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(httpErrors.UNAUTHORIZED.code)
        .json(httpErrors.UNAUTHORIZED);
    }

    const payload = decodeToken(token);

    const foundUser = await knex<User>("users")
      .where({
        id: payload.id,
      })
      ?.first();

    if (!foundUser) {
      return res.status(httpErrors.FORBIDDEN.code).json(httpErrors.FORBIDDEN);
    }

    (req as any).userId = foundUser.id;
    (req as any).userRole = foundUser.role;

    next();
  } catch (error) {
    return res
      .status(httpErrors.UNAUTHORIZED.code)
      .json(httpErrors.UNAUTHORIZED);
  }
}

export async function validateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(httpErrors.UNAUTHORIZED.code)
        .json(httpErrors.UNAUTHORIZED);
    }

    const payload = decodeToken(token);

    const foundUser = await knex<User>("users").where("id", payload.id).first();

    if (foundUser?.role !== "ADMIN") {
      return res.status(httpErrors.FORBIDDEN.code).json(httpErrors.FORBIDDEN);
    }

    (req as any).userId = foundUser.id;
    (req as any).userRole = foundUser.role;

    next();
  } catch (error) {
    return res
      .status(httpErrors.UNAUTHORIZED.code)
      .json(httpErrors.UNAUTHORIZED);
  }
}
