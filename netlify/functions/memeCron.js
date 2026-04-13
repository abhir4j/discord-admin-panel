const { schedule } = require('@netlify/functions');

const handler = async (event) => {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHANNEL_ID = "1489694806254030989"; // Put your #memes channel ID here

    // 1. A list of the best subreddits for Hinglish / Indian memes
    const subreddits = ['IndianMeyMeys', 'FingMemes', 'dankinindia', 'sunraybee'];
    
    // Pick a random subreddit from the list so the memes don't get repetitive
    const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];

    try {
        // 2. Fetch a batch of 10 memes at once from the chosen subreddit
        const memeResponse = await fetch(`https://meme-api.com/gimme/${randomSub}/10`);
        const data = await memeResponse.json();

        // 3. THE QUALITY FILTER! 🛡️
        // Keep only memes with more than 300 upvotes AND make sure they aren't NSFW
        const goodMemes = data.memes.filter(meme => meme.ups > 300 && meme.nsfw === false);

        // If all 10 memes were bad (under 300 upvotes), we skip sending anything this time
        if (goodMemes.length === 0) {
            console.log("No high-quality memes found this time. Skipping delivery!");
            return { statusCode: 200 };
        }

        // Pick the first meme that survived our filter
        const bestMeme = goodMemes[0];

        // 4. Format the message for Discord
        const discordPayload = {
            embeds: [{
                title: bestMeme.title,
                image: { url: bestMeme.url },
                
                
            }]
        };

        // 5. Send to Discord
        await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(discordPayload)
        });

        console.log("High-quality Hinglish meme delivered!");
        return { statusCode: 200 };
    } catch (error) {
        console.error("Meme delivery failed:", error);
        return { statusCode: 500 };
    }
};

// Runs every 30 minutes
exports.handler = schedule('*/30 * * * *', handler);