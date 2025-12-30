const { GoogleGenerativeAI } = require('@google/generative-ai');

class PriceEngine {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Extracts prices from raw text across platforms
     */
    async analyzePrices(rawContent) {
        const prompt = `
            You are a expert price analyst for the Iranian market. 
            Below is a raw text from Telegram/Eitaa/Rubika. 
            Extract all product names and their prices. 
            Format the result as a clean, professional Farsi message for a customer channel.
            Include a comparison if there are multiple sellers.
            
            TEXT:
            ${rawContent}
        `;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("AI Analysis Error:", error.message);
            return "Unable to analyze prices at this moment.";
        }
    }

    /**
     * Decides how to reply to a seller based on conversation history
     */
    async handleNegotiation(sellerReply, history) {
        const prompt = `
            You are an assistant for a merchant in Iran. 
            You are messaging a seller to get the best price.
            
            History: ${JSON.stringify(history)}
            Last reply from seller: "${sellerReply}"
            
            Goal: Get the final price for the requested product. 
            If the seller asks for details (like color/model), provide a reasonable follow-up.
            If they give a price, thank them.
            
            Return ONLY the text of the message you want to send back.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("AI Negotiation Error:", error.message);
            return null;
        }
    }
}

module.exports = PriceEngine;
