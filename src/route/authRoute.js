import expess from 'express';
import { authMiddleware } from "../middileware/authMiddleware.js";
import { login, logout, register,refresh, adminRegister, adminLogin, getAllUsers, createUser, deleteUserById } from '../controller/authController.js';
import { SuperAdminRoleCheck } from '../middileware/roleMiddleware.js';

const authRouter = expess.Router();

authRouter.post('/register',register);
authRouter.post('/admin-register',adminRegister);
authRouter.get('/allusers',authMiddleware,getAllUsers);
authRouter.post('/post-user',authMiddleware,SuperAdminRoleCheck,createUser);
authRouter.post('/admin-login',adminLogin);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post("/refresh", refresh);
authRouter.delete("/delete/:id",authMiddleware,SuperAdminRoleCheck, deleteUserById);
authRouter.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default authRouter;