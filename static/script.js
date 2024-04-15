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
        });
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

     //Display Sentiment Analysis 
     //var positiveCommentsDiv = document.getElementById('sentimentanalysis');
     //positiveCommentsDiv.innerHTML = '<h3>Sentiment Analysis:</h3>';

    // Display pie chart
    var ctx = document.getElementById('sentimentPieChart').getContext('2d');
    var sentimentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [positiveCount, negativeCount, neutralCount],
                backgroundColor: ['#11a8ab', '#e64c65', '#fcb150'],
            }],
        },
        options: {
            title: {
                display: true,
                text: 'Sentiment Analysis',
            },
        },
    });
    document.getElementById('firstBox').style.display = 'flex';
}

function displayPositiveNegativeComments(comments) {
    // Sort comments by polarity
    comments.sort((a, b) => {
        return b.Polarity - a.Polarity; // Descending order
    });

    // Display top 3 positive and top 3 negative comments
    var positiveCommentsDiv = document.getElementById('positiveComments');
    var negativeCommentsDiv = document.getElementById('negativeComments');

    positiveCommentsDiv.innerHTML = '<h3>Positive Comments:</h3>';
    negativeCommentsDiv.innerHTML = '<h3>Negative Comments:</h3>';

    var positiveCount = 0;
    var negativeCount = 0;

    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.Sentiment === 'positive' && positiveCount < 3) {
            positiveCommentsDiv.innerHTML += `<p>${comment.text}</p>`;
            positiveCount++;
        } else if (comment.Sentiment === 'negative' && negativeCount < 3) {
            negativeCommentsDiv.innerHTML += `<p>${comment.text}</p>`;
            negativeCount++;
        }
        if (positiveCount === 3 && negativeCount === 3) {
            break; // Stop iterating if both positive and negative limits are reached
        }
    }
}




function extractTimeSeriesData(comments) {
    // Create an object to store comment counts for each date
    const commentCounts = {};

    // Count comments for each date
    comments.forEach(comment => {
        const date = comment.updated_at.split('T')[0]; // Extract the date from the timestamp 

        if (commentCounts[date]) {
            commentCounts[date]++;
        } else {
            commentCounts[date] = 1;
        }
    });

    // Convert the comment counts object into an array of {timestamp, count} objects
    const timeSeriesData = Object.keys(commentCounts).map(date => ({
        timestamp: date,
        count: commentCounts[date],
    }));

    return timeSeriesData;
}

function displayTimeSeriesAnalysis(comments) {
    const timeSeriesData = extractTimeSeriesData(comments);

    // Create heading element
    var heading = document.createElement('h3');
    heading.textContent = 'Time Series Analysis of Comments:';

    // Get the container element for the chart canvas
    var container = document.getElementById('timeSeriesAnalysisChart').parentNode;

    // Append the heading before the chart canvas
    container.insertBefore(heading, document.getElementById('timeSeriesAnalysisChart'));

    // Display time series analysis chart
    var ctxTimeSeries = document.getElementById('timeSeriesAnalysisChart').getContext('2d');
    var timeSeriesChart = new Chart(ctxTimeSeries, {
        type: 'line',
        data: {
            labels: timeSeriesData.map(data => data.timestamp),
            datasets: [{
                label: 'Number of Comments Over Time',
                data: timeSeriesData.map(data => data.count),
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
            }],
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'YYYY-MM-DD', // Specify only the date format
                        unit: 'day', // Display by day
                        displayFormats: {
                            day: 'YYYY-MM-DD', // Adjust the display format to show only date
                        },
                    },
                    title: {
                        display: true,
                        text: 'Date', // Change the x-axis title to 'Date'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Comments',
                    },
                },
            },
        },
    });
}




function displayMostLikedComments(comments) {
    // Sort comments by like count
    var sortedComments = comments.slice().sort((a, b) => b.like_count - a.like_count);

    // Display the top 10 most liked comments
    var mostLikedCommentsDiv = document.getElementById('mostLikedComments');
    mostLikedCommentsDiv.innerHTML = '<h3>Most Liked Comments:</h3>';

    for (var i = 0; i < Math.min(5, sortedComments.length); i++) {
        mostLikedCommentsDiv.innerHTML += `<p>${sortedComments[i].text} - ${sortedComments[i].like_count} likes</p>`;
    }
    document.getElementById('mostLikedComments').style.display = 'flex';
}



function findSubscribersAndNonSubscribers(comments) {
    //Function to find subscribers who commented and non-subscribers who commented
    var subscribersCount = 0;
    var nonSubscribersCount = 0;

    comments.forEach(comment => {
        // Use the 'is_subscriber' property to determine if the commenter is a subscriber
        if (comment.is_subscriber) {
            subscribersCount++;
        } else {
            nonSubscribersCount++;
        }
    });

    return {
        subscribersCount: subscribersCount,
        nonSubscribersCount: nonSubscribersCount,
    };
}

function updateSubscribersGraph(data) {
    //updating subscribers and non subscribers graph
    var ctx = document.getElementById('subscribersGraph').getContext('2d');
    var subscribersGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Subscribers', 'Non-Subscribers'],
            datasets: [{
                label: 'Subscribers vs Non-Subscribers',
                data: [data.nonSubscribersCount, data.subscribersCount],
                backgroundColor: ['#11a8ab', '#e64c65'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displaySubscribersAndNonSubscribers(comments) {
    //displaying subscribers and non-subscribers
    var subscribersAndNonSubscribersDiv = document.getElementById('subscribersAndNonSubscribers');
    subscribersAndNonSubscribersDiv.innerHTML = '<h3>Subscribers and Non-Subscribers who commented:</h3>';

    var subscribersAndNonSubscribers = findSubscribersAndNonSubscribers(comments);
    updateSubscribersGraph(subscribersAndNonSubscribers);

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

function displayVideoFeedback(comments) {
    // Analyze comments for overall sentiment and provide feedback
    var overallSentiment = analyzeOverallSentiment(comments);

    var videoFeedbackDiv = document.getElementById('videoFeedback');
    videoFeedbackDiv.innerHTML = `<h3>Video Feedback:</h3><p>${overallSentiment}</p>`;

    document.getElementById('videoFeedback').style.display = 'flex';
}


function displayResults(data) {
    var resultsDiv = document.getElementById('analysisResults');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Check if data and video_info are present
    if (data && data.video_info) {
        // Extract video ID from YouTube link
        var videoId = extractVideoId(data.video_info.link);
        
        // Fetch video details using YouTube Data API
        fetchVideoDetails(videoId)
            .then(videoData => {
                // Display video information
                var videoTitle = videoData.items[0].snippet.title;
                var videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                var youtubeLink = data.video_info.link;

                var videoContainer = document.createElement('div');
                videoContainer.innerHTML = `
                    <h2>${videoTitle}</h2>
                    <a href="${youtubeLink}" target="_blank">
                        <img src="${videoThumbnail}" alt="${videoTitle}" width="450px" height="200px">
                    </a>
                `;
                resultsDiv.appendChild(videoContainer);
            })
            .catch(error => {
                console.error('Error fetching video details:', error);
                resultsDiv.innerHTML += '<p>Error fetching video details.</p>';
            });
    } else {
        resultsDiv.innerHTML += '<p>Unable to retrieve video information.</p>';
        return;
    }



    
    // Check if data.comments is an array
    if (Array.isArray(data.comments)) {
        displaySentimentPieChart(data.comments);  
        displayPositiveNegativeComments(data.comments);
        displayTimeSeriesAnalysis(data.comments);
        displayMostLikedComments(data.comments);
        displaySubscribersAndNonSubscribers(data.comments);
        displayVideoFeedback(data.comments);
    } else {
        resultsDiv.innerHTML += '<p>No comments data available.</p>';
    }
}
function extractVideoId(videoLink) {
    // Extract video ID from YouTube link
    var videoId = videoLink.split('v=')[1];
    var ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
    }
    return videoId;
}

async function fetchVideoDetails(videoId) {
    // Fetch video details using YouTube Data API
    // var apiKey = 'AIzaSyBC4qWUlwUM-NpHGomWK7GrMfjixo2DD0c';
    // var apiKey = 'AIzaSyDI7YrA0IC-ehD9xWSloS-HMn4UT4cVEbI';
    // var apiKey = 'AIzaSyDoVR86a1nMWTAcMXfnoZF-QYdO3JqaCfU'
    var apiKey = 'AIzaSyDoVR86a1nMWTAcMXfnoZF-QYdO3JqaCfU';
    var apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;

    var response = await fetch(apiUrl);
    var data = await response.json();
    return data;
}


