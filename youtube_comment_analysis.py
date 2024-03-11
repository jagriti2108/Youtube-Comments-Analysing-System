import re
import googleapiclient.discovery
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def get_video_id_from_link(url):
    pattern = r'(?:https?://)?(?:www\.)?(?:youtube\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([a-zA-Z0-9_-]{11})'
    match = re.match(pattern, url)
    return match.group(1) if match else None

def get_youtube_comments(video_link, developer_key):
    api_service_name = "youtube"
    api_version = "v3"

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=developer_key)

    video_id = get_video_id_from_link(video_link)

    request = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100
    )

    comments = []

    response = request.execute()

    for item in response.get('items', []):
        comment = item['snippet']['topLevelComment']['snippet']
        public = item['snippet']['isPublic']
        comments.append([
            comment['authorDisplayName'],
            comment['publishedAt'],
            comment['likeCount'],
            comment['textOriginal'],
            public
        ])

    while 'nextPageToken' in response:
        nextPageToken = response['nextPageToken']
        nextRequest = youtube.commentThreads().list(part="snippet", videoId=video_id, maxResults=100, pageToken=nextPageToken)
        response = nextRequest.execute()
        for item in response.get('items', []):
            comment = item['snippet']['topLevelComment']['snippet']
            public = item['snippet']['isPublic']
            comments.append([
                comment['authorDisplayName'],
                comment['publishedAt'],
                comment['likeCount'],
                comment['textOriginal'],
                public
            ])

    df = pd.DataFrame(comments, columns=['author', 'updated_at', 'like_count', 'text', 'public'])
    df.to_csv("comments.csv")

    return df

def analyze_comments(youtube_link, developer_key):
    comments_df = get_youtube_comments(youtube_link, developer_key)

    analyzer = SentimentIntensityAnalyzer()
    comments_df['Sentiment'] = comments_df['text'].apply(lambda x: 'positive' if analyzer.polarity_scores(x)['compound'] >= 0.05 else ('negative' if analyzer.polarity_scores(x)['compound'] <= -0.05 else 'neutral'))

    return {
        'comments': comments_df.to_dict(orient='records'),
        'video_info': {
            'title': 'Video Title',
            'thumbnail': 'Thumbnail URL',
            'link': youtube_link
        }
    }
