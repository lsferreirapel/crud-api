import { Request, Response } from "express";
import knex from "../../db/db_config";
import { httpErrors, httpSuccess } from "../common/constants/httpMessages";
import { Product } from "../types";

async function create(req: Request, res: Response) {
  const {
    name,
    description,
    quantityInStock,
    price,
    owner_id,
  }: Partial<Product> = req.body;
  const image = req?.file?.path;

  if (!name || !description || !quantityInStock || !price || !owner_id) {
    return res.status(httpErrors.BAD_REQUEST.code).json(httpErrors.BAD_REQUEST);
  }

  try {
    const createdProduct = await knex<Product>("products").insert({
      name,
      description,
      quantityInStock,
      price,
      owner_id,
      image,
      created_at: new Date().toISOString(),
    });

    return res.status(httpSuccess.CREATED.code).json({
      id: createdProduct[0],
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

  const baseQueryBuilder = knex<Product>("products")
    .select(
      "products.*",
      "users.firstName as owner_firstName",
      "users.lastName as owner_lastName"
    )
    .leftJoin("users", "users.id", "products.owner_id")
    .offset(page <= 0 ? 0 : page - 1)
    .limit(limit);

  if (q) {
    baseQueryBuilder
      .whereLike("name", `%${q}%`)
      .orWhereLike("description", `%${q}%`);
  }

  try {
    const foundProducts = await baseQueryBuilder;

    return res.status(httpSuccess.OK.code).json(foundProducts);
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function readById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const foundProduct = await knex<Product>("products").select("*").where({
    id,
  });

  if (!foundProduct) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  return res.status(200).json(foundProduct);
}

async function update(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!req?.params?.id) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  const update = req.body;

  const image = req?.file?.path;

  delete update?.id;
  delete update?.created_at;
  delete update?.updated_at;

  try {
    const foundProduct = await knex<Product>("products")
      .select("*")
      .where({
        id,
      })
      .update({
        ...update,
        ...(image ? { image } : undefined),
        updated_at: new Date().toISOString(),
      });

    return res
      .status(httpSuccess.OK.code)
      .json({ id: foundProduct, ...httpSuccess.OK });
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

  const deletedProduct = await knex<Product>("products")
    .select("*")
    .where({
      id,
    })
    .del();

  return res
    .status(httpSuccess.OK.code)
    .json({ id: deletedProduct, ...httpSuccess.OK });
}

export default {
  create,
  // eslint-disable-next-line prettier/prettier
  readAll, readById,
  update,
  delete: del,
};
