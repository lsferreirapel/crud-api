import { Request, Response } from "express";
import knex from "../../db/db_config";
import { httpErrors, httpSuccess } from "../common/constants/httpMessages";
import { Product, Rating, User } from "../types";

async function totalUsers(req: Request, res: Response) {
  try {
    const total = await knex<User>("users")
      .where({ role: "USER" })
      .count("id as users")
      .first();

    return res.status(httpSuccess.OK.code).json({
      total,
      ...httpSuccess.OK,
    });
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function totalSellers(req: Request, res: Response) {
  try {
    const total = await knex<User>("users")
      .where({ role: "ADMIN" })
      .count("id as sellers")
      .first();

    return res.status(httpSuccess.OK.code).json({
      total,
      ...httpSuccess.OK,
    });
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function totalProducts(req: Request, res: Response) {
  try {
    const total = await knex<Product>("products")
      .count("id as products")
      .first();

    return res.status(httpSuccess.OK.code).json({
      total,
      ...httpSuccess.OK,
    });
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function totalReviews(req: Request, res: Response) {
  try {
    const total = await knex<Rating>("ratings").count("id as reviews").first();

    return res.status(httpSuccess.OK.code).json({
      total,
      ...httpSuccess.OK,
    });
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

export default {
  totalUsers,
  totalSellers,
  totalProducts,
  totalReviews,
};
