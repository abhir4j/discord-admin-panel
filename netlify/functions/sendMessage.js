exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const data = JSON.parse(event.body);
    const channelId = data.channelId;
    const messageContent = data.message;

    try {
        // Call the Discord API to send the message
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: messageContent
            })
        });

        if (!response.ok) throw new Error('Discord API rejected the request');

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Message sent!' })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};