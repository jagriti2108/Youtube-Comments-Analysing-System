document.getElementById('videoForm').addEventListener('submit', function(event) {
  event.preventDefault();
  showVideo();
});

function showVideo() {
  var videoLink = document.getElementById('videoLink').value;

  // Create an iframe element
  var iframe = document.createElement('iframe');

  // Set the iframe attributes for a YouTube video
  iframe.setAttribute('width', '350');
  iframe.setAttribute('height', '250');
  iframe.setAttribute('src', 'https://www.youtube.com/embed/' + extractVideoId(videoLink));
  iframe.setAttribute('frameborder', '0');
  iframe.style.margin = '20px';

  // Clear any previous content in the video-container and append the iframe
  var videoContainer = document.getElementById('video-container');
  videoContainer.innerHTML = '';
  videoContainer.appendChild(iframe);

  // Display the video container
  videoContainer.style.display = 'block';
}

// Helper function to extract the video ID from a YouTube URL
function extractVideoId(url) {
  var match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}