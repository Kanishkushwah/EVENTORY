// Promo Controller for Eventory 🎬
import { PromoService } from "../services/promo.service.js";

export const PromoController = {
    async validatePromo(req, res) {
        try {
            const { code, amount } = req.body;
            if (!code || !amount) {
                return res.status(400).json({ success: false, message: "Code and amount are required." });
            }

            const result = await PromoService.validatePromo(code, amount);

            if (result.error) {
                return res.status(400).json({ success: false, message: result.error });
            }

            return res.json({ success: true, ...result });
        } catch (err) {
            console.error("Promo Controller Error:", err);
            return res.status(500).json({ success: false, message: "Server error during promo validation." });
        }
    }
};
