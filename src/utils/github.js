const axios = require('axios');

class GithubSync {
    constructor(token, repoOwner, repoName) {
        this.token = token;
        this.owner = repoOwner;
        this.repo = repoName;
        this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/config.json`;
    }

    async updateConfig(newConfig) {
        try {
            // 1. Get the current file SHA (required for update)
            const getFile = await axios.get(this.baseUrl, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            const sha = getFile.data.sha;

            // 2. Prepare the payload
            const content = Buffer.from(JSON.stringify(newConfig, null, 2)).toString('base64');
            const data = {
                message: "Update dynamic config via Telegram Bot",
                content: content,
                sha: sha
            };

            // 3. Put the new file
            await axios.put(this.baseUrl, data, {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            console.log("GitHub: config.json updated successfully via API");
            return true;
        } catch (error) {
            console.error("GitHub Sync Error:", error.response ? error.response.data : error.message);
            return false;
        }
    }
}

module.exports = GithubSync;
