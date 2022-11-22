import bcrypt from "bcrypt";
import knex from "../../db/db_config";
import { User } from "../types";
import { Request, Response } from "express";
import { encodePassword, generateToken } from "../common/utils/auth";
import { httpErrors, httpSuccess } from "../common/constants/httpMessages";

async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(httpErrors.BAD_REQUEST.code).json(httpErrors.BAD_REQUEST);
  }

  try {
    const foundUser = await knex<User>("users").where({ email })?.first();

    if (!foundUser?.id) {
      return res.status(httpErrors.UNAUTHORIZED.code).json({
        ...httpErrors.UNAUTHORIZED,
        message: "invalid email or password",
      });
    }

    if (bcrypt.compareSync(password, foundUser.password)) {
      const token = generateToken({
        id: foundUser.id,
        role: foundUser.role,
      });

      return res
        .status(httpSuccess.OK.code)
        .json({ success: httpSuccess.OK, token });
    } else {
      return res.status(httpErrors.UNAUTHORIZED.code).json({
        ...httpErrors.UNAUTHORIZED,
        message: "invalid email or password",
      });
    }
  } catch (error) {
    return res.status(httpErrors.UNAUTHORIZED.code).json({
      ...httpErrors.UNAUTHORIZED,
      message: "invalid email or password",
    });
  }
}

async function register(req: Request, res: Response) {
  const { firstName, lastName, birthDate, document, email, password } =
    req.body;

  const role = "USER";

  if (
    !firstName ||
    !lastName ||
    !birthDate ||
    !document ||
    !email ||
    !password
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

  if (password.length < 6) {
    return res.status(httpErrors.BAD_REQUEST.code).json({
      ...httpErrors.BAD_REQUEST,
      message: "Password must be at least 6 characters.",
    });
  }

  const hash = encodePassword(password);

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

  return res.status(httpSuccess.CREATED.code).json(createdUser);
}

export default {
  login,
  register,
};
