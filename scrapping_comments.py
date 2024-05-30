# import re
# #Function to extract id from link
# def get_video_id_from_link(url):
#     # Regular expression pattern to extract YouTube video ID
#     pattern = r'(?:https?://)?(?:www\.)?(?:youtube\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([a-zA-Z0-9_-]{11})'
#     match = re.match(pattern, url)
#     if match:
#         return match.group(1)
#     else:
#         return None


# dev = "AIzaSyDI7YrA0IC-ehD9xWSloS-HMn4UT4cVEbI"

# import googleapiclient.discovery
# import pandas as pd
# #Pull all comments
# api_service_name = "youtube"
# api_version = "v3"
# DEVELOPER_KEY = dev

# youtube = googleapiclient.discovery.build(
#     api_service_name, api_version, developerKey=DEVELOPER_KEY)

# print("Enter video link")
# youtube_link=input()
# video_id = get_video_id_from_link(youtube_link)
# str(video_id)

# request = youtube.commentThreads().list(
#     part="snippet",
#     videoId=video_id,
#     maxResults=100
# )

# comments = []

# # Execute the request.
# response = request.execute()

# # Get the comments from the response.
# for item in response['items']:
#     comment = item['snippet']['topLevelComment']['snippet']
#     public = item['snippet']['isPublic']
#     comments.append([
#         comment['authorDisplayName'],
#         comment['publishedAt'],
#         comment['likeCount'],
#         comment['textOriginal'],
#         public
#     ])

# while (1 == 1):
#   try:
#    nextPageToken = response['nextPageToken']
#   except KeyError:
#    break
#   nextPageToken = response['nextPageToken']
#   # Create a new request object with the next page token.
#   nextRequest = youtube.commentThreads().list(part="snippet", videoId="-GJgqIJsTME", maxResults=100, pageToken=nextPageToken)
#   # Execute the next request.
#   response = nextRequest.execute()
#   # Get the comments from the next response.
#   for item in response['items']:
#     comment = item['snippet']['topLevelComment']['snippet']
#     public = item['snippet']['isPublic']
#     comments.append([
#         comment['authorDisplayName'],
#         comment['publishedAt'],
#         comment['likeCount'],
#         comment['textOriginal'],
#         public
#     ])

# df = pd.DataFrame(comments, columns=['author', 'updated_at', 'like_count', 'text','public'])
# df.info()

# # response['items'][0]

# print(df.head(100))

# #Sort by likes and get top 10
# df.sort_values(by='like_count', ascending=False)[0:10]

# #Printing comments in descending order on the basis of most liked comments
# print(df.sort_values(by='like_count', ascending=False)[0:10])

# df.to_csv("/workspaces/Youtube-Comments-Analysing-System/comments.csv")



# from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
# from sklearn.metrics import accuracy_score
# import pandas as pd

# # Load your comments from the CSV file
# comments_df = pd.read_csv('comments.csv')

# # Create a SentimentIntensityAnalyzer object
# analyzer = SentimentIntensityAnalyzer()

# # Define a function to get sentiment scores and labels
# def get_sentiment(text):
#     scores = analyzer.polarity_scores(text)
#     compound_score = scores['compound']

#     if compound_score >= 0.05:
#         return 'positive'
#     elif compound_score <= -0.05:
#         return 'negative'
#     else:
#         return 'neutral'

# # Apply the sentiment analysis function to each comment
# comments_df['Sentiment'] = comments_df['text'].apply(get_sentiment)

# # Display the results
# print(comments_df)

# analyzer = SentimentIntensityAnalyzer()

# # Predict sentiments for each comment in the testing dataset
# predicted_sentiments = []
# for comment in comments_df:
#     # Perform sentiment analysis using VADER
#     sentiment_score = analyzer.polarity_scores(comment)
    
#     # Classify the sentiment based on the compound score
#     if sentiment_score['compound'] >= 0.05:
#         predicted_sentiments.append('positive')
#     elif sentiment_score['compound'] <= -0.05:
#         predicted_sentiments.append('negative')
#     else:
#         predicted_sentiments.append('neutral')

# # Calculate accuracy
# accuracy = accuracy_score(true_sentiments, predicted_sentiments)
# print("Accuracy:", accuracy)


from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.metrics import accuracy_score
import pandas as pd
import random

# Load your comments from the CSV file
comments_df = pd.read_csv('/workspaces/Youtube-Comments-Analysing-System/comments.csv')

# Create a SentimentIntensityAnalyzer object
analyzer = SentimentIntensityAnalyzer()

# Define a function to get sentiment scores and labels
def get_sentiment(text):
    scores = analyzer.polarity_scores(text)
    compound_score = scores['compound']

    if compound_score >= 0.05:
        return 'positive'
    elif compound_score <= -0.05:
        return 'negative'
    else:
        return 'neutral'

# Apply the sentiment analysis function to each comment
comments_df['Sentiment'] = comments_df['text'].apply(get_sentiment)

# Display the results
print(comments_df)

# Generate random true sentiments for demonstration purposes
true_sentiments = ['positive' if random.random() < 0.4 else 'negative' if random.random() < 0.4 else 'neutral' for _ in range(len(comments_df))]

# Predict sentiments for each comment in the dataset
predicted_sentiments = comments_df['Sentiment']

# Calculate accuracy
accuracy = accuracy_score(true_sentiments, predicted_sentiments)
print("Accuracy:", accuracy)
