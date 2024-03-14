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
     var positiveCommentsDiv = document.getElementById('sentimentanalysis');
     positiveCommentsDiv.innerHTML = '<h3>Sentiment Analysis:</h3>';

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
                backgroundColor: ['green', 'red'],
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
}



function displayResults(data) {
    var resultsDiv = document.getElementById('analysisResults');
    resultsDiv.innerHTML = ''; //Clear previous results

    // Check if data and video_info are present
    if (data && data.video_info) {
        // Display video information
        resultsDiv.innerHTML += `<h2>${data.video_info.title}</h2>`;
        resultsDiv.innerHTML += `<img src="${data.video_info.thumbnail}" alt="Video Thumbnail">`;
        resultsDiv.innerHTML += `<p><a href="${data.video_info.link}" target="_blank">View Video</a></p>`;
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





