const axios = require('axios');

class EitaaAdapter {
    /**
     * @param {string} token - Eitaayar API Token (e.g., bot123:abc-def)
     */
    constructor(token) {
        this.token = token;
        this.baseUrl = `https://eitaayar.ir/api/${this.token}`;
    }

    /**
     * Sends a text message to a chat id (channel, group, or user)
     * @param {string|number} chatId - Target chat ID
     * @param {string} text - Message content
     */
    async sendMessage(chatId, text) {
        try {
            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: chatId,
                text: text
            });

            if (response.data && response.data.ok) {
                console.log(`>> Eitaa Message Sent to ${chatId}`);
                return true;
            } else {
                console.error(`>> Eitaa API Error: ${response.data.description}`);
                return false;
            }
        } catch (error) {
            console.error('>> Eitaa Request Failed:', error.message);
            return false;
        }
    }

    /**
     * Placeholder for pulling history. 
     * Note: Eitaayar API is primarily for sending (push). 
     * We will use Puppeteer for scraping individual seller chats later.
     */
    async getHistory(chatId, limit = 5) {
        console.warn(">> getHistory not supported by Eitaayar Official API. Use Negotiator (Puppeteer) for scraping.");
        return [];
    }

    stop() {
        // No persistent connection for REST API
    }
}

module.exports = EitaaAdapter;
