import bcrypt from "bcrypt";
import knex from "../../db/db_config";
import { User } from "../types";
import { Request, Response } from "express";
import { encodePassword, generateToken } from "../common/utils/auth";
import { httpErrors, httpSuccess } from "../common/constants/httpMessages";
import nodemailer from "nodemailer";
import { Md5 } from "ts-md5";

async function _sendEmail(name: string, email: string, hash: string) {
  try {
    const host = process.env.EMAIL_SMPT_HOST ?? "smtp.mailtrap.io";
    const port = Number(process.env.EMAIL_SMPT_PORT) ?? 2525;
    const auth = {
      user: process.env.EMAIL_SMPT_USERNAME ?? "828f26a29b5dcc",
      pass: process.env.EMAIL_SMPT_PASSWORD ?? "d293709dc5bde9",
    };

    const API_URL = process.env.API_URL ?? "http://localhost:4000";

    const transporter = nodemailer.createTransport({
      host,
      port,
      auth,
    });

    const link = API_URL + "/auth/confirm/" + hash;

    const body = `
    <p>Olá ${name},</p>
    <p>Precisamos verificar seu endereço de e-mail antes que você possa acessar a nossa plataforma.</p>
    <p>Verifique seu endereço de e-mail <a href="${link}">clicando aqui!</a></p>
    <p>Obrigado!</p>
  `;

    await transporter.sendMail({
      from: "'Crud do DEDE' <crud@email.com>",
      to: email,
      subject: "Por favor confirme o seu e-mail",
      text: `Para confirmar seu e-mail, copie e cole no browser o endereço ${link}`,
      html: body,
    });
  } catch (error) {
    console.log("SEND EMAIL ERROR: ", error);
  }
}

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

    if (!foundUser?.active) {
      return res
        .status(httpErrors.NEED_ACTIVE.code)
        .json(httpErrors.NEED_ACTIVE);
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

  const confirmation_hash = Md5.hashStr(email + document + Date.now());

  try {
    await knex.transaction(async (trx) => {
      await _sendEmail(firstName + " " + lastName, email, confirmation_hash);

      const createdUser = await trx<User>("users").insert({
        firstName,
        lastName,
        birthDate,
        document,
        email,
        password: hash,
        role,
        created_at: new Date().toISOString(),
        confirmation_hash,
      });

      return res.status(httpSuccess.CREATED.code).json({
        id: createdUser[0],
        ...httpSuccess.CREATED,
      });
    });
  } catch (err) {
    res.status(httpErrors.INTERNAL_SERVER_ERROR.code).json({
      ...httpErrors.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
}

async function confirmUser(req: Request, res: Response) {
  const confirmation_hash = req?.params?.hash as string;

  const WEB_URL = process.env.WEB_URL ?? "http://localhost:4001";

  try {
    const foundUser = await knex<User>("users")
      .where({ confirmation_hash })
      .first()
      .update({ active: true });

    if (!foundUser) {
      return res.status(httpErrors.BAD_REQUEST.code).json({
        ...httpErrors.BAD_REQUEST,
        message: "Invalid hash, please try again.",
      });
    }

    return res.status(httpSuccess.OK.code).redirect(WEB_URL);
  } catch (error) {
    res.status(httpErrors.BAD_REQUEST.code).json({
      ...httpErrors.BAD_REQUEST,
      message: "Invalid hash, please try again.",
    });
  }
}

export default {
  login,
  register,
  confirmUser,
};
