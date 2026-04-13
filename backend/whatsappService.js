require('dotenv').config();
const twilio = require('twilio');

/**
 * TWILIO CONFIGURATION
 * Loads credentials from the environment vault for security.
 */
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initializing the Twilio Neural Link
const client = new twilio(accountSid, authToken);

/**
 * sendStockAlert
 * Triggers a real-time WhatsApp notification when hardware levels drop.
 * * @param {string} productName - Name of the low-stock hardware
 * @param {number} currentStock - Remaining units in the inventory
 */
const sendStockAlert = async (productName, currentStock) => {
    try {
        const message = await client.messages.create({
            // Twilio's Global Sandbox Number
            from: 'whatsapp:+14155238886', 
            
            // Destination: Admin's registered WhatsApp number
            to: `whatsapp:${process.env.ADMIN_PHONE}`, 
            
            // Strategic Alert Payload (MSI Tactical Theme)
            body: `⚠️ *TECH SMART INVENTORY ALERT* \n\n` +
                  `Hardware Identifier: *${productName}*\n` +
                  `Operational Status: *CRITICAL LOW STOCK*\n` +
                  `Current Inventory: *${currentStock} units*\n\n` +
                  `Please initiate the restocking protocol immediately to maintain system uptime.`
        });

        console.log(`[OK] Intelligence Alert Dispatched! SID: ${message.sid}`);
    } catch (error) {
        console.error(`[ERROR] Neural Messaging Failed: ${error.message}`);
    }
};

// Exporting the service for integration with the main backend
module.exports = { sendStockAlert };

