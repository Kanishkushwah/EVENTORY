import QRCode from "qrcode";

export const QRService = {
    async generateQR(data) {
        try {
            const qrDataUrl = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            return qrDataUrl;
        } catch (error) {
            console.error("QR Generation Error:", error);
            throw error;
        }
    }
};