import { Router } from "express";
import UserController from "./controller/UserController";
import RatingController from "./controller/RatingController";
import AuthController from "./controller/AuthController";
import ProductController from "./controller/ProductController";
import { validateAdmin, validateUser } from "./middleware/ValidateRole";
import upload from "./middleware/StoreFiles";
import DashboardController from "./controller/DashboardController";
import PdfController from "./controller/PdfController";

export const router = Router();

// AUTH ROUTES
router
  .post("/auth/login", AuthController.login)
  .post("/auth/register", AuthController.register)
  .get("/auth/confirm/:hash", AuthController.confirmUser);

// DASHBOARD ROUTES
router
  .get("/dashboard/total/users", validateUser, DashboardController.totalUsers)
  .get(
    "/dashboard/total/sellers",
    validateUser,
    DashboardController.totalSellers
  )
  .get(
    "/dashboard/total/products",
    validateUser,
    DashboardController.totalProducts
  )
  .get(
    "/dashboard/total/reviews",
    validateUser,
    DashboardController.totalReviews
  );

// ME ROUTES
router
  .get("/me", validateUser, UserController.readMe)
  .patch("/me", validateUser, upload.single("avatar"), UserController.updateMe);

// USERS ROUTES
router
  .post("/users", validateAdmin, UserController.create)
  .get("/users", validateUser, UserController.readAll)
  .get("/users/:id", validateUser, UserController.readById)
  .patch("/users/:id", validateAdmin, UserController.update)
  .delete("/users/:id", validateAdmin, UserController.delete);

// PRODUCTS ROUTES
router
  .post(
    "/products",
    validateAdmin,
    upload.single("image"),
    ProductController.create
  )
  .get("/products", validateUser, ProductController.readAll)
  .get("/products/:id", validateUser, ProductController.readById)
  .patch(
    "/products/:id",
    validateAdmin,
    upload.single("image"),
    ProductController.update
  )
  .delete("/products/:id", validateAdmin, ProductController.delete);

// RATINGS ROUTES
router
  .post("/ratings", validateUser, RatingController.create)
  .get("/ratings", validateUser, RatingController.readAll)
  .get("/ratings/:id", validateUser, RatingController.readById)
  .patch("/ratings", validateUser, RatingController.update)
  .delete("/ratings", validateUser, RatingController.delete);

// PDF ROUTES
router
  .get("/products/html/list", PdfController.listProductsHTML)
  .get("/products/pdf/list", PdfController.productsPDF);
