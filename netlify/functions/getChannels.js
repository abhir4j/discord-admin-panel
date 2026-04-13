exports.handler = async (event) => {
    // We will set these securely in Netlify later
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const GUILD_ID = process.env.GUILD_ID;

    try {
        // Call the Discord API to get server channels
        const response = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const channels = await response.json();

        // Filter out categories, we only want Text (0) and Voice (2) channels
        const sendableChannels = channels.filter(c => c.type === 0 || c.type === 2);

        return {
            statusCode: 200,
            body: JSON.stringify(sendableChannels)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch channels' }) };
    }
};