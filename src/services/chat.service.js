import { GoogleGenerativeAI } from "@google/generative-ai"
import HairService from "../models/HairService.model.js"
import DiscountCard from "../models/DiscountCard.model.js"
import ComboService from "../models/ComboService.model.js"
import { env } from "../config/environment.js"

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const chatService = {

  async askAI(message) {

    /* ================= SERVICES ================= */

    const services = await HairService.find({
      isActive: true,
      isDeleted: false
    })
      .select("name price duration")
      .limit(10)

    const serviceList = services
      .map(s => `${s.name} - giá ${s.price} VND - thời gian ${s.duration} phút`)
      .join("\n")

    /* ================= DISCOUNT ================= */

    const now = new Date()

    const discounts = await DiscountCard.find({
      isActive: true,
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .select("code discountType discountValue maxDiscountAmount")
      .limit(5)

    const discountList = discounts
      .map(d => {

        if (d.discountType === "percent") {
          return `Mã ${d.code} - giảm ${d.discountValue}% tối đa ${d.maxDiscountAmount} VND`
        }

        return `Mã ${d.code} - giảm ${d.discountValue} VND`
      })
      .join("\n")
      const combos = await ComboService.find({
        isActive: true,
        isDeleted: false
        })
        .select("name pricing.comboPrice duration")
        .limit(5)

        const comboList = combos
        .map(c => `${c.name} - giá ${c.pricing.comboPrice} VND - thời gian ${c.duration} phút`)
        .join("\n")

    /* ================= PROMPT ================= */

   const hairStyleGuide = `
Mặt tròn:
- Undercut
- Side Part
- Quiff

Mặt dài:
- Layer
- Two Block

Mặt vuông:
- Buzz Cut
- Ivy League

Tóc dày:
- Layer
- Undercut

Tóc mỏng:
- Textured Crop
- Side Part
`

  /* ================= PROMPT ================= */

  const prompt = `
Bạn là chatbot của tiệm tóc.

Nhiệm vụ:
- tư vấn dịch vụ
- gợi ý combo
- gợi ý kiểu tóc
- gợi ý mã giảm giá

DỊCH VỤ:
${serviceList}

COMBO:
${comboList}

MÃ GIẢM GIÁ:
${discountList}

KIỂU TÓC:
${hairStyleGuide}

Câu hỏi khách:
${message}
`


    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    })

    const result = await model.generateContent(prompt)

    return result.response.text()
  }

}