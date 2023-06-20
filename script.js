
        

        let contents = [];
        function listContents(contents) {
            contents.forEach(e=>{
                var contentsList = document.getElementById("ul");
                var li = document.createElement("li");
                var p = document.createElement("p");
                p.textContent = "platform: "+e.platform+" date: "+e.date+" url: "+e.url;
                var divContent = document.createElement("div");
                
                li.classList.add("vertical-border");

                if(e.platform == "youtube"){
                    divContent.innerHTML = `<iframe width="640" height="360" src="https://www.youtube.com/embed/VyNE97zXbBk" title="OYNADIĞIMIZ GÜZEL OYUNLAR - OYNAMAK İSTEDİĞİMİZ ÇIKACAK OYUNLAR" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
                    li.classList.add("vertical-border-red");
                }
                else if(e.platform == "twitter"){
                    divContent.innerHTML = `${e.text}`;
                    li.classList.add("vertical-border-blue");
                }
                li.appendChild(p);
                li.appendChild(divContent);
                contentsList.appendChild(li);
                contentsList.appendChild(document.createElement("hr"));
            })
        }

        function getTweets() {
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var videoUrls = response.tweets;
            
                // Process the videoUrls as needed
                videoUrls.forEach(function (e) {
                  console.log(e);
                  var obj = {platform: "twitter", date: e.date, url: e.url, text: e.text}
                  contents.push(obj);
                });
              } else {
                console.error('Error:', xhr.status);
              }
            }
          };
      
          xhr.open('GET', 'http://localhost:3000/tweets');
          xhr.send();
        }

        function getVideoURLs() {
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var videoUrls = response.videos;
                //console.log(videoUrls)
                // Process the videoUrls as needed
                videoUrls.forEach(function (v) {
                  console.log(v);
                    const time = v.publishedAt.slice(11, 16);
                  var obj = {platform: "youtube", date: time, url: v.url}
                  contents.push(obj);
                });
              } else {
                console.error('Error:', xhr.status);
              }
            }
          };
      
          xhr.open('GET', 'http://localhost:3000/videos');
          xhr.send();
        }
        // Custom comparison function for sorting
function compareTimestamps(a, b) {
  const timeA = a.date.split(":");
  const timeB = b.date.split(":");

  const hourA = parseInt(timeA[0], 10);
  const minuteA = parseInt(timeA[1], 10);

  const hourB = parseInt(timeB[0], 10);
  const minuteB = parseInt(timeB[1], 10);

  if (hourA < hourB) {
    return -1;
  } else if (hourA > hourB) {
    return 1;
  } else {
    if (minuteA < minuteB) {
      return -1;
    } else if (minuteA > minuteB) {
      return 1;
    } else {
      return 0;
    }
  }
} 

async function getTwChannelStatus(username) {
  const channelName = username;

  if (channelName) {
    try {
      const response = await fetch(`/channel/${channelName}`);
      const result = await response.json();

      if (response.ok) {
        const { channel, online } = result;
        const status = online ? 'Online' : 'Offline';
        console.log(`Channel "${channel}" is ${status}`);
        return result;
      } else {
        const { error } = result;
        console.log(`Error: ${error}`);
        return -1;
      }
    } catch (error) {
      alert('Error: Failed to fetch status');
      return -1;
    }
  } else {
    alert('Error: Please enter a channel name');
    return -1;
  }
}

async function getYtChannelStatus(username) {
  const channelName = username;

  if (channelName) {
    try {
      const response = await fetch(`/check-channel/${channelName}`);
      const result = await response.json();

      if (response.ok) {
        const { stream, online } = result;
        const status = online ? 'Online' : 'Offline';
        console.log(`Channel "${channelName}" is ${status}`);
        return result;
      } else {
        const { error } = result;
        console.log(`Error: ${error}`);
        return -1;
      }
    } catch (error) {
      alert('Error: Failed to fetch channel status');
      return -1;
    }
  } else {
    alert('Error: Please enter a channel name');
    return -1;
  }
}
function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}
function getTwitchStreamerUsername(url) {
	var channelUrl = new URL(url);
	var path = channelUrl.pathname
	path = path.replace("/","")
	return path;
}

function getYouTubeVideoId(url) {
	// Regular expression pattern to match YouTube URLs
	var youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
	
	// Match the pattern against the URL
	var match = url.match(youtubePattern);
	
	if (match && match[1]) {
	  // Extracted video ID
	  return match[1];
	} else {
	  // Invalid YouTube URL
	  return null;
	}
}
async function getYtChannelProfilePicture(channelId) {
	//const apiUrl = `http://localhost:3000/channel/${channelId}/profile-picture`;
  
	try {
	  const response = await fetch(`/channel/${channelId}/profile-picture`);
	  const data = await response.json();
		
	  if (data.profilePicture) {
		console.log('Profile Picture:', data.profilePicture);
		// Do something with the profile picture URL
		return data;
	  } else {
		console.log('Profile Picture not found');
		// Handle the case when the profile picture is not found
		return null;
	  }
	} catch (error) {
	  console.error('Error:', error);
	  // Handle the error case
	  return null;
	}
  }

async function getTwChannelProfilePicture(channelId) {
	const apiUrl = `http://localhost:3000/twitch/${channelId}`;
  
	try {
	  const response = await fetch(apiUrl);
	  const data = await response.json();
		
	  if (data.profilePicture) {
		console.log('Profile Picture:', data.profilePicture);
		// Do something with the profile picture URL
		return data;
	  } else {
		console.log('Profile Picture not found');
		// Handle the case when the profile picture is not found
		return null;
	  }
	} catch (error) {
	  console.error('Error:', error);
	  // Handle the error case
	  return null;
	}
}

function removeStreamer(username) {
	console.log(username)
	var indexToRemove = arrayOfStreamers.findIndex(element=>element.id == username)
	console.log(arrayOfStreamers)
	console.log(indexToRemove)
	arrayOfStreamers.splice(indexToRemove, 1)
	localStorage.setItem('arrayOfStreamers', JSON.stringify(arrayOfStreamers));
	arrayOfStreamers = JSON.parse(localStorage.getItem('arrayOfStreamers'));
  document.getElementById(username).remove();
}
  
function openStream(username, platform, streamurl, status, profilePicture, userTitle, streamTitle) {

	var streamDiv = document.getElementById("stream-bloque");
	var chatDiv = document.getElementById("chat-bloque");
	if(document.getElementById("stream_embed")) document.getElementById("stream_embed").remove();
	if(document.getElementById("chat_embed")) document.getElementById("chat_embed").remove();

	console.log(platform, status)
  var streamerType;
	if(status){

		console.log(streamurl);
		if(platform == "youtube"){
		streamerType = "ytStreamer"
		var videoId = getYouTubeVideoId(streamurl);
		streamDiv.innerHTML = `
    	<iframe id="stream_embed" width="937" height="527" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    	`
		
		chatDiv.innerHTML = `<iframe id="chat_embed" width="100%" height="100%" src="https://www.youtube.com/live_chat?v=${videoId}&embed_domain=localhost&dark_theme=1" frameborder="0"></iframe>
		`
		}
		else if(platform == "twitch"){
      
		  streamerType = "twStreamer"
			streamDiv.innerHTML = `
			<iframe id="stream_embed" src="https://player.twitch.tv/?channel=${username}&parent=allinonelive.onrender.com" frameborder="0" allowfullscreen="true" scrolling="no" height="527" width="937"></iframe>`
		
			chatDiv.innerHTML = `<iframe  id="chat_embed"  src="https://www.twitch.tv/embed/${username}/chat?parent=allinonelive.onrender.com&darkpopout"  height="100%"  width="100%"></iframe>`
		}
	
	}
	else{
		streamDiv.innerHTML = `<div style="height:100%; width:100%; display:flex; justify-content:center; align-items:center;"><h1 class="text-light">Stream is not found</h1></div>`
	}

	var bottomPartDiv = document.createElement("div");
  bottomPartDiv.classList.add("row");
  bottomPartDiv.style.width = "100%";
	bottomPartDiv.innerHTML = `
  <div class="col-md-9 p-2 channelBloque" style="height: 100px; display:flex; align-items: center;">
    <a href="#" class="profileImg ${streamerType+"img"}"><img class="rounded-circle" style="width: 70px; height: 70px;" src="${profilePicture}" alt=""></a>
    <div class="row">
	<a class="pl-2 col-md-12 streamerLink ${streamerType}" href="#">${userTitle}</a>
	<h6 class="pl-2 col-md-12" href="#" style="color: white;">${streamTitle}</a>
	</div>
  </div>
  <div class="col-md-3 p-2" style="display:flex; justify-content: flex-end; align-items: center;">
    <button id="btn_${username}" onclick="removeStreamer('${username}')" class="btn btn-danger remove-btn">Yayıncıyı Kaldır</button>
  </div>
  `
	streamDiv.appendChild(bottomPartDiv);
}

/*
window.addEventListener('load', async () => {
  getYtChannelStatus("voleapp")
  getTwChannelStatus("videoyun")
  
});
*/
/*
        window.onload = function () {
           
          //getVideoURLs();
          //getTweets(); 
          setTimeout(() => {
            
            //contents.sort(compareTimestamps);
            //console.log(contents);
            //listContents(contents);
          }, 5000);

          
        };
*/
