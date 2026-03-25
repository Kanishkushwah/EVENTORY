// Promo Service for Eventory 🎬
// Handles promo code validation with hardcoded fallbacks and Supabase integration
import { supabase } from "../config/supabase.js";

const HARDCODED_CODES = {
    'EVENTORY20': { code: 'EVENTORY20', discount_percent: 20, max_discount_amount: 200, min_purchase: 500, description: '20% off up to ₹200 on bookings above ₹500' },
    'WELCOME50': { code: 'WELCOME50', discount_percent: 50, max_discount_amount: 100, min_purchase: 0, description: 'New user special: 50% off up to ₹100' },
    'MOVIE60': { code: 'MOVIE60', discount_percent: 10, max_discount_amount: 60, min_purchase: 200, description: 'Movie special: ₹60 off on movie bookings' }
};

export const PromoService = {
    async validatePromo(code, amount) {
        if (!code) return { error: "Please enter a promo code." };

        const cleanCode = code.trim().toUpperCase();

        // 1. Try DB first (if table exists)
        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', cleanCode)
                .eq('is_active', true)
                .single();

            if (!error && data) {
                return this.calculateDiscount(data, amount);
            }
        } catch (e) {
            console.log("Promo DB not ready, falling back to local codes.");
        }

        // 2. Fallback to hardcoded codes
        const codeData = HARDCODED_CODES[cleanCode];
        if (codeData) {
            return this.calculateDiscount(codeData, amount);
        }

        return { error: "Invalid or expired promo code." };
    },

    calculateDiscount(promo, amount) {
        if (amount < (promo.min_purchase_amount || promo.min_purchase || 0)) {
            return { error: `Min purchase of ₹${promo.min_purchase_amount || promo.min_purchase} required.` };
        }

        let discount = (amount * promo.discount_percent) / 100;
        if (discount > (promo.max_discount_amount || 500)) {
            discount = promo.max_discount_amount;
        }

        return {
            success: true,
            code: promo.code,
            discountAmount: Math.round(discount),
            newTotal: Math.round(amount - discount),
            description: promo.description
        };
    }
};
