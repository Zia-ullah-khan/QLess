import qrcode from 'qrcode';

export const generateQRForTransaction = async (transactionId, storeId, itemCount, timestamp) => {
    try {
        const qrPayload = JSON.stringify({
            transactionId,
            storeId,
            itemCount,
            timestamp
        });
        const qrCodeDataURL = await qrcode.toDataURL(qrPayload);
        return qrCodeDataURL;
    } catch (error) {
        throw new Error('Failed to generate QR Code: ' + error.message);
    }
}
