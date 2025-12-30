# 🤖 Multi-Platform Price Bot (ربات قیمت فراپخش)

A bot that scrapes prices from Telegram/Eitaa channels, analyzes them with Gemini AI, and posts results to your channel.

## 🚀 How It Works

1. **Runs on GitHub Actions** - Every hour, automatically
2. **Scrapes prices** from seller channels you configure
3. **AI Analysis** - Uses Gemini to summarize and compare prices
4. **Posts to your channel** - Clean, formatted Farsi messages

## ⚙️ Setup

### 1. Add GitHub Secrets

Go to **Settings → Secrets → Actions** and add:

| Secret Name | Description |
|-------------|-------------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather |
| `GEMINI_API_KEY` | Google Gemini API key |
| `EITAAYAR_TOKEN` | Eitaa bot token (optional) |

### 2. Configure Channels

Edit `config.json` to add your channels:

```json
{
  "platforms": {
    "telegram": {
      "enabled": true,
      "sources": ["@seller_channel_1", "@seller_channel_2"],
      "targets": ["@your_price_channel"]
    }
  }
}
```

### 3. Run Manually

Go to **Actions** tab → **Multi-Platform Price Bot** → **Run workflow**

## 📝 Bot Commands

Chat with your bot on Telegram:

- `/add telegram @channel` - Add a source channel
- `/list` - Show all configured channels

## 📄 License

MIT
