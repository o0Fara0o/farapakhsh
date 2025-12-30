require('dotenv').config();
const fs = require('fs');
const PriceEngine = require('./src/engine');
const TelegramAdapter = require('./src/adapters/telegram');
const EitaaAdapter = require('./src/adapters/eitaa');
const WhatsAppAdapter = require('./src/adapters/whatsapp');
const GithubSync = require('./src/utils/github');

// Load dynamic config
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Initializing Core Components
const engine = new PriceEngine(process.env.GEMINI_API_KEY);
const telegram = new TelegramAdapter(process.env.TELEGRAM_BOT_TOKEN);
const eitaa = new EitaaAdapter(process.env.EITAAYAR_TOKEN);
const whatsapp = new WhatsAppAdapter(); // Session path defined inside

// Initialize GitHub Sync with the user's repository details
const github = new GithubSync(process.env.GITHUB_TOKEN, 'o0Fara0o', 'farapakhsh');

// Dynamic Config Management via Telegram
telegram.bot.command('add', async (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 3) return ctx.reply("Usage: /add [platform] [id]\nExample: /add eitaa @seller_id");

    const [_, platform, id] = args;
    if (!config.platforms[platform]) return ctx.reply(`Invalid platform: ${platform}`);

    config.platforms[platform].sources.push(id);

    // 1. Save locally
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    // 2. Sync to GitHub Agentically
    ctx.reply("🔄 Synchronizing with GitHub...");
    const success = await github.updateConfig(config);

    if (success) {
        ctx.reply(`✅ Added ${id} to ${platform} and pushed to GitHub successfully!`);
    } else {
        ctx.reply(`⚠️ Added ${id} locally, but GitHub Sync failed. Check your token and repo name.`);
    }
});

telegram.bot.command('list', (ctx) => {
    let message = "<b>Current Source Channels:</b>\n";
    for (const [p, data] of Object.entries(config.platforms)) {
        if (data.sources && data.sources.length > 0) {
            message += `\n<b>${p.toUpperCase()}:</b>\n- ${data.sources.join('\n- ')}\n`;
        }
    }
    ctx.reply(message, { parse_mode: 'HTML' });
});

async function main() {
    console.log(">> Multi-Platform Price Bot Started");

    // Start Telegram (with resilience)
    if (config.platforms.telegram.enabled) {
        try {
            await telegram.start();
            console.log("✅ Telegram Adapter Active");
        } catch (error) {
            console.error("❌ Telegram Failed to Start:", error.message);
            console.log(">> Tip: Enable 'TUN Mode' or 'System Proxy' in your VPN.");
        }
    }

    // Start Eitaa (Official API - usually works without VPN)
    if (config.platforms.eitaa.enabled) {
        try {
            console.log(">> Eitaa Adapter Active (Official API)");
            // Official API is REST, no "start" needed usually, but we keep it modular
        } catch (error) {
            console.error("❌ Eitaa Failed:", error.message);
        }
    }

    // Start WhatsApp (QR based)
    if (config.platforms.whatsapp.enabled) {
        try {
            await whatsapp.start();
            console.log(">> WhatsApp Adapter Initializing... (Watch for QR)");
        } catch (error) {
            console.error("❌ WhatsApp Failed:", error.message);
        }
    }

    // Interactive Mode
    if (process.env.GITHUB_ACTIONS) {
        console.log(">> Running in Scheduled Mode");
        await runScraperLoop();
        process.exit(0);
    }
}

async function runScraperLoop() {
    console.log(">> Starting Scraper Loop...");

    const sources = config.platforms.telegram.sources || [];
    const targets = config.platforms.telegram.targets || [];

    if (targets.length === 0) {
        console.log("⚠️ No target channel configured.");
        return;
    }

    for (const source of sources) {
        console.log(`>> Checking channel: ${source}`);

        // In this version, we'll use a placeholder for "scraping" 
        // because true scraping requires a User Bot (GramJS) session.
        // For testing, we'll use a sample text to show Gemini in action.

        const sampleRawText = `
            قیمت امروز محصولات در کانال ${source}:
            گوشی سامسونگ Samsung S24 Ultra: 72,000,000 تومان
            iPhone 15 Pro Max: 85,500,000 تومان
            Xiaomi 14: 45,000,000 تومان
        `;

        console.log(">> Sending to Gemini for analysis...");
        const analyzedText = await engine.analyzePrices(sampleRawText);

        for (const target of targets) {
            try {
                await telegram.sendMessage(target, analyzedText);
                console.log(`✅ Analyzed prices from ${source} posted to ${target}`);
            } catch (error) {
                console.error(`❌ Failed to post to ${target}:`, error.message);
            }
        }
    }
}

main().catch(console.error);

// Graceful shutdown
process.once('SIGINT', () => {
    telegram.stop();
    process.exit(0);
});
