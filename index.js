import { YOUTUBE_API_KEY } from "./env.js";

// https://www.youtube.com/watch?v=BmUZ2wp1lM8&list=PLFs4vir_WsTwKi93uWnfp4xdVuu4M-OdN&ab_channel=Kurzgesagt%E2%80%93InaNutshell

const playlistInput = document.getElementById('playlistInput');
const videosDiv = document.getElementById('videos');

playlistInput.addEventListener('change', async () => {
    const playlistData = await getPlaylistData(playlistInput.value);
    updateUIWithPlaylistData(playlistData);
});

const data = await getPlaylistData("PLFs4vir_WsTwKi93uWnfp4xdVuu4M-OdN")
updateUIWithPlaylistData(data);

function updateUIWithPlaylistData(playlistData) {
    videosDiv.innerHTML = "";
    playlistData.forEach(videoData => {
        const videoDiv = document.createElement("div");
        videoDiv.className = videoData.videoID;
        videoDiv.addEventListener("click", () => {
            if (videoDiv.style.filter) {
                videoDiv.style.removeProperty("filter");
            }
            else {
                videoDiv.style.filter = "blur(5px)";
            }
        });
        const videoTitle = document.createElement("p");
        videoTitle.innerHTML = videoData.title;
        const videoLink = document.createElement("a");
        videoLink.target = '_blank';
        videoLink.href = `https://www.youtube.com/watch?v=${videoData.videoID}`;
        const videoThumbnail = document.createElement("img");
        videoThumbnail.src = videoData.thumbnailData.url;

        videoLink.append(videoThumbnail);
        videoDiv.appendChild(videoTitle);
        videoDiv.appendChild(videoLink);
        videosDiv.appendChild(videoDiv);
    });
}

async function getPlaylistData(playlistId) {
    const playlistData = [];
    let json = null;
    let nextPageToken = "";
    do {
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50`;
        url += `&playlistId=${playlistId}`;
        url += `&key=${YOUTUBE_API_KEY}`;
        if (nextPageToken != "") {
            url += `&pageToken=${nextPageToken}`;
        }
        // Playlist added
        let response = await fetch(url);
        json = await response.json();
        
        // Get all elements of the playlist
        for (let video of json.items) {
            const videoID = video.snippet.resourceId.videoId;
            const title = video.snippet.title;
            const thumbnailData = video.snippet.thumbnails.default; // or .standard\
            playlistData.push({
                videoID,
                title,
                thumbnailData,
            })
        }
        
        // Pagination
        nextPageToken = json.snippet?.nextPageToken || "";
    } while (nextPageToken != "");

    return playlistData;
}