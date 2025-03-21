import express from "express";
import {
  getMe,
  createUser,
  updateUser,
  deleteUser,
  createSuperUser,
  createAdmin,
  promoteAdmin,
  loginUser,
} from "../controllers/users.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/getme/:id", protectRoute, getMe);
router.post("/createuser", createUser);
router.put("/updateuser/:id", protectRoute, updateUser);
router.delete("/deleteuser/:id", protectRoute, deleteUser);
router.post("/createsuperuser", createSuperUser);
router.post("/createadmin", protectRoute, createAdmin);
router.post("/promoteadmin/:id", protectRoute, promoteAdmin);

export default router;
