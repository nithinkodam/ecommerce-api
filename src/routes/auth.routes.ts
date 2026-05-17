import { Router } from "express";

import { test,  register, login, me } from "../controllers/auth.controller"
import { authMiddleware } from "../middleware/auth.middleware";

const r = Router();

r.get("/test", test);

r.post("/register", register)

r.post("/login", login)

r.get("/me", authMiddleware, me)

export default r;