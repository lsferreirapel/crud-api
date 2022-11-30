import { Request, Response } from "express";
import knex from "../../db/db_config";
import { httpErrors, httpSuccess } from "../common/constants/httpMessages";
import { Rating } from "../types";

async function create(req: Request, res: Response) {
  const { value, product_id }: Partial<Rating> = req.body;

  const user_id = (req as any)?.userId;

  if (!value || !user_id || !product_id) {
    return res.status(httpErrors.BAD_REQUEST.code).json(httpErrors.BAD_REQUEST);
  }

  try {
    const createdRating = await knex<Rating>("ratings").insert({
      value,
      user_id,
      product_id,
      created_at: new Date().toISOString(),
    });

    return res.status(httpSuccess.CREATED.code).json({
      id: createdRating[0],
      ...httpSuccess.CREATED,
    });
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function readAll(req: Request, res: Response) {
  const q = req?.query?.q;
  const page = Number(req.query._page ?? 0);
  const limit = Number(req.query._limit ?? 20);

  const baseQueryBuilder = knex<Rating>("ratings")
    .select(
      "ratings.*",
      "users.firstName as user_firstName",
      "products.name as product_name"
    )
    .leftJoin("users", "users.id", "ratings.user_id")
    .leftJoin("products", "products.id", "ratings.product_id")
    .offset(page <= 0 ? 0 : page - 1)
    .limit(limit);

  if (q) {
    baseQueryBuilder
      .whereLike("value", `%${q}%`)
      .orWhereLike("user_firstName", `%${q}%`)
      .orWhereLike("product_name", `%${q}%`);
  }

  try {
    const foundRatings = await baseQueryBuilder;

    return res.status(httpSuccess.OK.code).json(foundRatings);
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function readById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const foundRating = await knex<Rating>("ratings").select("*").where({
    id,
  });

  if (!foundRating) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  return res.status(httpSuccess.OK.code).json(foundRating);
}

async function update(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!req?.params?.id) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  const update = req.body;

  delete update?.id;
  delete update?.user_id;
  delete update?.product_id;
  delete update?.created_at;
  delete update?.updated_at;

  try {
    const foundRating = await knex<Rating>("ratings")
      .select("*")
      .where({
        id,
      })
      .update({ ...update, updated_at: new Date().toISOString() });

    return res
      .status(httpSuccess.OK.code)
      .json({ id: foundRating, ...httpSuccess.OK });
  } catch (error) {
    return res
      .status(httpErrors.INTERNAL_SERVER_ERROR.code)
      .json(httpErrors.INTERNAL_SERVER_ERROR);
  }
}

async function del(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!req?.params?.id) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  const deletedRating = await knex<Rating>("ratings")
    .select("*")
    .where({
      id,
    })
    .del();

  return res
    .status(httpSuccess.OK.code)
    .json({ id: deletedRating, ...httpSuccess.OK });
}

export default {
  create,
  // eslint-disable-next-line prettier/prettier
  readAll, readById,
  update,
  delete: del,
};
