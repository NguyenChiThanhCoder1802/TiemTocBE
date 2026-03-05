import { chatService } from "../services/chat.service.js"

export const chatController = {

  async ask(req, res, next) {

    try {

      const { message } = req.body

      if (!message) {
        return res.status(400).json({
          message: "Message is required"
        })
      }

      const reply = await chatService.askAI(message)

      res.json({
       message: "AI reply",
        data: {
            reply
        }
      })

    } catch (error) {
      next(error)
    }

  }

}