process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

// Enable CORS
app.use(cors());

const getChannelId = async (channelUrl) => {
  try {
    const response = await axios.get(channelUrl);
    const $ = cheerio.load(response.data);
    const ogUrl = $('meta[property="og:url"]').attr('content');
    
    if (!ogUrl) {
      throw new Error('Channel ID not found');
    }
    
    const channelId = ogUrl.match(/\/channel\/([^/]+)/)[1];
    return channelId;
  } catch (error) {
    console.error('Error retrieving channel ID:', error);
    return null;
  }
};

app.use(express.static(__dirname, { // host the whole directory
  extensions: ["html", "htm", "gif", "png"],
}))
  //console.table(contenttoSend);
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

app.get('/channel/:channelName', async (req, res) => {
  try {
    const { channelName } = req.params;
    const url = `https://www.twitch.tv/${channelName}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    //const onlineStatus = $('script[type="publication"]').text().includes('"isLiveBroadcast": true');
    
    
    const ogDescMeta = $('meta[property="og:description"]');
    const scriptContent = $('script[type="application/ld+json"]').html();
    
    const jsonContent = JSON.parse(scriptContent);

    if(jsonContent != null)
    var onlineStatus = jsonContent[0].publication.isLiveBroadcast;

    else onlineStatus = false;

    var desc = ogDescMeta.attr('content');
    const result = {
      channel: channelName,
      online: onlineStatus,
      stream: url,
      streamTitle: desc
    };

    res.json(result);
  } catch (error) {
    console.error('Error occurred while checking channel status:', error);
    res.status(500).json({ error: 'An error occurred while checking channel status' });
  }
});

app.get('/check-channel/:channel', (req, res) => {
  
  const { channel } = req.params;
  const url = `https://www.youtube.com/@${channel}/live`;

  axios.get(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

      // Find the <meta> tag with property="og:url"
      const ogUrlMeta = $('meta[property="og:url"]');
      const titleMeta = $('meta[name="title"]');
      
      const scriptContent = $('script[nonce="application/ld+json"]').html();

      // Check if the <meta> tag exists
      if (ogUrlMeta.length > 0) {
        const content = ogUrlMeta.attr('content');
        const title = titleMeta.attr('content');
        

        // Check if the content includes the word "channel"
        const online = content.includes('channel') == false;
        
        const result = {
          stream: content,
          online: online,
          streamTitle: title
        };
        res.json(result);
      } else {
        res.status(404).json({ error: 'No <meta> tag with property="og:url" found.' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Error retrieving the website content.' });
    });
});

app.get('/twitch/:channelName', async (req, res) => {
  try {
    const { channelName } = req.params;
    const url = `https://www.twitch.tv/${channelName}`;

    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const profileImage = $('meta[property="og:image"]').attr('content');
    var title = $('meta[property="og:title"]').attr('content');

    title = title.replace(" - Twitch", "")
    console.log(title)
    

    res.json({ profilePicture: profileImage, title: title });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve Twitch channel information' });
  }
});

app.get('/channel/:channelId/profile-picture', (req, res) => {
	const channelUrl = `https://www.youtube.com/@${req.params.channelId}`;
  
	axios.get(channelUrl)
	  .then(response => {
		const $ = cheerio.load(response.data);
		const imageSrc = $('link[rel="image_src"]').attr('href');
    const title = $('meta[property="og:title"]').attr('content');
		if (imageSrc) {
		  res.json({ profilePicture: imageSrc, title: title});
		} else {
		  res.status(404).json({ error: 'Profile picture not found.' });
		}
	  })
	  .catch(error => {
		res.status(500).json({ error: 'Failed to retrieve the channel page.' });
	  });
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

  
