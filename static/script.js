function analyzeVideo() {
    var videoLink = document.getElementById('videoLink').value;

    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'videoLink=' + encodeURIComponent(videoLink),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle or display the error as needed
        });
}

function displayResults(data) {
    var resultsDiv = document.getElementById('analysisResults');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Check if data and video_info are present
    if (data && data.video_info) {
        // Display video information
        resultsDiv.innerHTML += `<h2>${data.video_info.title}</h2>`;
        resultsDiv.innerHTML += `<img src="${data.video_info.thumbnail}" alt="Video Thumbnail">`;
        resultsDiv.innerHTML += `<p><a href="${data.video_info.link}" target="_blank">View Video</a></p>`;
    } else {
        resultsDiv.innerHTML += '<p>Unable to retrieve video information.</p>';
        return; // Stop further execution if video_info is missing
    }

    // Check if data.comments is an array
    if (Array.isArray(data.comments)) {
        // Continue with the rest of the display logic

        // Display sentiments pie chart
        displaySentimentPieChart(data.comments);

        // Display some positive and negative comments
        displayPositiveNegativeComments(data.comments);

        // Display most liked comments
        displayMostLikedComments(data.comments);

        // Display video feedback based on comments
        displayVideoFeedback(data.comments);

    } else {
        resultsDiv.innerHTML += '<p>No comments data available.</p>';
    }
}

function displaySentimentPieChart(comments) {
    // Count sentiments
    var positiveCount = 0;
    var negativeCount = 0;
    var neutralCount = 0;

    comments.forEach(comment => {
        if (comment.Sentiment === 'positive') {
            positiveCount++;
        } else if (comment.Sentiment === 'negative') {
            negativeCount++;
        } else {
            neutralCount++;
        }
    });

    // Display pie chart
    var ctx = document.getElementById('sentimentPieChart').getContext('2d');
    var sentimentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [positiveCount, negativeCount, neutralCount],
                backgroundColor: ['green', 'red', 'gray'],
            }],
        },
        options: {
            title: {
                display: true,
                text: 'Sentiment Analysis',
            },
        },
    });
}

function displayPositiveNegativeComments(comments) {
    // Display some positive and negative comments
    var positiveCommentsDiv = document.getElementById('positiveComments');
    var negativeCommentsDiv = document.getElementById('negativeComments');

    positiveCommentsDiv.innerHTML = '<h3>Positive Comments:</h3>';
    negativeCommentsDiv.innerHTML = '<h3>Negative Comments:</h3>';

    comments.forEach(comment => {
        if (comment.Sentiment === 'positive' && positiveCommentsDiv.children.length < 5) {
            positiveCommentsDiv.innerHTML += `<p>${comment.text}</p>`;
        } else if (comment.Sentiment === 'negative' && negativeCommentsDiv.children.length < 5) {
            negativeCommentsDiv.innerHTML += `<p>${comment.text}</p>`;
        }
    });
}

function displayMostLikedComments(comments) {
    // Sort comments by like count
    var sortedComments = comments.slice().sort((a, b) => b.like_count - a.like_count);

    // Display the top 10 most liked comments
    var mostLikedCommentsDiv = document.getElementById('mostLikedComments');
    mostLikedCommentsDiv.innerHTML = '<h3>Most Liked Comments:</h3>';

    for (var i = 0; i < Math.min(10, sortedComments.length); i++) {
        mostLikedCommentsDiv.innerHTML += `<p>${sortedComments[i].text} - ${sortedComments[i].like_count} likes</p>`;
    }
}

function displayVideoFeedback(comments) {
    // Analyze comments for overall sentiment and provide feedback
    var overallSentiment = analyzeOverallSentiment(comments);

    var videoFeedbackDiv = document.getElementById('videoFeedback');
    videoFeedbackDiv.innerHTML = `<h3>Video Feedback:</h3><p>${overallSentiment}</p>`;
}

function analyzeOverallSentiment(comments) {
    // Analyze overall sentiment based on comments
    var positiveCount = 0;
    var negativeCount = 0;

    comments.forEach(comment => {
        if (comment.Sentiment === 'positive') {
            positiveCount++;
        } else if (comment.Sentiment === 'negative') {
            negativeCount++;
        }
    });

    if (positiveCount > negativeCount) {
        return 'Overall positive feedback for the video!';
    } else if (negativeCount > positiveCount) {
        return 'Overall negative feedback for the video.';
    } else {
        return 'Mixed feedback for the video.';
    }
}
