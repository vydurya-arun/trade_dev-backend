import expess from 'express';
import { authMiddleware } from "../middileware/authMiddleware.js";
import { login, logout, register,refresh, adminRegister, adminLogin, getAllUsers, createUser } from '../controller/authController.js';

const authRouter = expess.Router();

authRouter.post('/register',register);
authRouter.post('/admin-register',adminRegister);
authRouter.get('/allusers',authMiddleware,getAllUsers);
authRouter.post('/post-user',authMiddleware,createUser);
authRouter.post('/admin-login',adminLogin);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post("/refresh", refresh);
authRouter.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default authRouter;