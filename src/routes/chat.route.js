import express from "express"
import { chatController } from "../controllers/chat.controller.js"

const Router = express.Router()

Router.post("/ask", chatController.ask)

export const ChatRouter = Router