import knex from "../../db/db_config";
import { Product } from "../types";
import ejs from "ejs";
import puppeteer from "puppeteer";
import { Request, Response } from "express";
import path from "node:path";

async function listProductsHTML(req: Request, res: Response) {
  try {
    const products = await knex<Product>("products").select("*");

    ejs.renderFile(
      path.join(__dirname, "..", "views/products.ejs"),
      { products },
      (err, html) => {
        if (err) {
          console.log("error: ", err);
          return res.status(400).send("Erro na geração da página");
        }
        res.status(200).send(html);
      }
    );
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error });
  }
}

async function productsPDF(req: Request, res: Response) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:4000/products/html/list");

  await page.waitForNetworkIdle();

  const pdf = await page.pdf({
    printBackground: true,
    format: "A4",
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  await browser.close();
  res.contentType("application/pdf");
  res.status(200).send(pdf);
}

export default {
  listProductsHTML,
  productsPDF,
};
