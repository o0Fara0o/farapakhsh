const { Telegraf } = require('telegraf');
const { SocksProxyAgent } = require('socks-proxy-agent');

class TelegramAdapter {
    constructor(token) {
        // On GitHub Actions, no proxy needed (servers are outside Iran)
        // Locally, use SOCKS5 proxy if available
        const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

        if (isGitHubActions) {
            this.bot = new Telegraf(token);
            console.log('>> Running on GitHub Actions (no proxy needed)');
        } else {
            try {
                const agent = new SocksProxyAgent('socks5h://127.0.0.1:10808');
                this.bot = new Telegraf(token, { telegram: { agent } });
                console.log('>> Using SOCKS5 proxy for local development');
            } catch (e) {
                this.bot = new Telegraf(token);
                console.log('>> No proxy available, running direct');
            }
        }
    }

    // Since standard bots can't read all messages in public channels without being admin,
    // we assume the bot is added to the source channel or target group.
    async getLatestMessages(chatId, limit = 5) {
        // Note: Generic Bot API doesn't have a simple "getHistory" method.
        // For a true scraper, we would use a User-Bot library (GramJS), 
        // but for a start, the bot will listen to incoming messages.
        console.log(`Telegram: Listening for messages in ${chatId}`);
        return []; // Placeholder for real-time listener logic
    }

    async sendMessage(chatId, text) {
        try {
            await this.bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' });
            console.log(`Telegram: Message sent to ${chatId}`);
        } catch (error) {
            console.error(`Telegram Error: ${error.message}`);
        }
    }

    async start() {
        return this.bot.launch();
    }

    stop() {
        this.bot.stop();
    }
}

module.exports = TelegramAdapter;
