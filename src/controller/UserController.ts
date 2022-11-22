import { Request, Response } from "express";
import knex from "../../db/db_config";
import { httpErrors, httpSuccess } from "../common/constants/httpMessages";
import { encodePassword } from "../common/utils/auth";
import { User } from "../types";

async function create(req: Request, res: Response) {
  const { firstName, lastName, birthDate, document, email, password, role } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !birthDate ||
    !document ||
    !email ||
    !password ||
    !role
  ) {
    return res.status(httpErrors.BAD_REQUEST.code).json(httpErrors.BAD_REQUEST);
  }

  const foundUser = await knex<User>("users")
    .where({ email })
    .orWhere({ document })
    ?.first();
  if (foundUser?.id) {
    return res.status(httpErrors.BAD_REQUEST.code).json({
      ...httpErrors.BAD_REQUEST,
      alias: "EMAIL_OR_DOCUMENT_ALREADY_EXISTS",
      message: "Email or document already exists.",
    });
  }

  if (role !== "USER" && role !== "ADMIN") {
    return res.status(httpErrors.BAD_REQUEST.code).json({
      ...httpErrors.BAD_REQUEST,
      message: "Role must be 'USER' or 'ADMIN'.",
    });
  }

  if (password.length < 6) {
    return res.status(httpErrors.BAD_REQUEST.code).json({
      ...httpErrors.BAD_REQUEST,
      message: "Password must be at least 6 characters.",
    });
  }

  const hash = encodePassword(password);

  try {
    const createdUser = await knex<User>("users").insert({
      firstName,
      lastName,
      birthDate,
      document,
      email,
      password: hash,
      role,
      created_at: new Date().toISOString(),
    });

    return res.status(httpSuccess.CREATED.code).json({
      id: createdUser[0],
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
  const foundUsers = await knex<User>("users").select("*");

  return res.status(httpSuccess.OK.code).json(foundUsers);
}

async function readById(req: Request, res: Response) {
  const id = Number(req.params.id);

  const foundUser = await knex<User>("users").select("*").where({
    id,
  });

  if (!foundUser) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  return res.status(200).json(foundUser);
}

async function update(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!req?.params?.id) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  const update = req.body;

  delete update?.id;
  delete update?.password;
  delete update?.role;
  delete update?.created_at;
  delete update?.updated_at;

  try {
    const foundUser = await knex<User>("users")
      .select("*")
      .where({
        id,
      })
      .update({ ...update, updated_at: new Date().toISOString() });

    return res
      .status(httpSuccess.OK.code)
      .json({ id: foundUser, ...httpSuccess.OK });
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

  const foundUser = await knex<User>("users")
    .select("*")
    .where({
      id,
    })
    .del();

  return res
    .status(httpSuccess.OK.code)
    .json({ id: foundUser, ...httpSuccess.OK });
}

// CUSTOM METHODS
async function readMe(req: Request, res: Response) {
  const id = (req as any)?.userId;

  const foundUser = await knex<User>("users").select("*").where({
    id,
  });

  if (!foundUser) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  return res.status(200).json(foundUser);
}

async function updateMe(req: Request, res: Response) {
  const id = (req as any)?.userId;

  if (!id) {
    return res.status(httpErrors.NOT_FOUND.code).json(httpErrors.NOT_FOUND);
  }

  const update = req.body;

  const avatar = req?.file?.path;
  const password = update?.password
    ? encodePassword(update?.password)
    : undefined;

  delete update?.id;
  delete update?.role;
  delete update?.created_at;
  delete update?.updated_at;

  try {
    const foundUser = await knex<User>("users")
      .select("*")
      .where({
        id,
      })
      .update({
        ...update,
        ...(avatar ? { avatar } : undefined),
        ...(password ? { password } : undefined),
        updated_at: new Date().toISOString(),
      });

    return res
      .status(httpSuccess.OK.code)
      .json({ id: foundUser, ...httpSuccess.OK });
  } catch (error) {
    return res
      .status(httpErrors.INTERNAL_SERVER_ERROR.code)
      .json(httpErrors.INTERNAL_SERVER_ERROR);
  }
}

export default {
  create,
  // eslint-disable-next-line prettier/prettier
  readAll, readById,
  update,
  delete: del,
  readMe,
  updateMe,
};
