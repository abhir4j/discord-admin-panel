exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const data = JSON.parse(event.body);
    
    const channelId = data.channelId;
    const messageContent = data.message || ""; // Allow empty text if there's a file
    const fileData = data.fileData; // The image in Base64 format
    const fileName = data.fileName;
    const mimeType = data.mimeType;

    try {
        // 1. Create a FormData object (This is how Discord accepts files)
        const formData = new FormData();
        
        // 2. Attach the text message
        formData.append('payload_json', JSON.stringify({ content: messageContent }));

        // 3. If there is a file, convert it from Base64 and attach it
        if (fileData) {
            const b64 = fileData.split(',')[1]; // Remove the data URI header
            const buffer = Buffer.from(b64, 'base64');
            const blob = new Blob([buffer], { type: mimeType || 'application/octet-stream' });
            formData.append('files[0]', blob, fileName);
        }

        // 4. Send to Discord
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`
                // CRITICAL: Do NOT set 'Content-Type' here! 
                // Fetch will automatically set it to 'multipart/form-data' with the correct boundary.
            },
            body: formData
        });

        if (!response.ok) throw new Error('Discord API rejected the request');

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Broadcast successful!' })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
