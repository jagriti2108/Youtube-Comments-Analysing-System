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

    # Additional imports
    from googleapiclient.errors import HttpError

    for item in response.get('items', []):
        comment = item['snippet']['topLevelComment']['snippet']
        public = item['snippet']['isPublic']
        author_id = comment.get('authorChannelId', {}).get('value', None)

        if author_id:
            try:
                # Fetch subscriber status using the YouTube Data API
                subscriber_status = get_subscriber_status(youtube, author_id)
            except HttpError as e:
                # Handle errors when fetching subscriber status
                print(f"Error fetching subscriber status: {str(e)}")
                subscriber_status = None
        else:
            subscriber_status = None

        comments.append({
            'author': comment['authorDisplayName'],
            'updated_at': comment['publishedAt'],
            'like_count': comment['likeCount'],
            'text': comment['textOriginal'],
            'public': public,
            'is_subscriber': subscriber_status
        })

    while 'nextPageToken' in response:
        nextPageToken = response['nextPageToken']
        nextRequest = youtube.commentThreads().list(
            part="snippet", videoId=video_id, maxResults=100, pageToken=nextPageToken)
        response = nextRequest.execute()

        for item in response.get('items', []):
            comment = item['snippet']['topLevelComment']['snippet']
            public = item['snippet']['isPublic']
            author_id = comment.get('authorChannelId', {}).get('value', None)

            if author_id:
                try:
                    # Fetch subscriber status using the YouTube Data API
                    subscriber_status = get_subscriber_status(youtube, author_id)
                except HttpError as e:
                    # Handle errors when fetching subscriber status
                    print(f"Error fetching subscriber status: {str(e)}")
                    subscriber_status = None
            else:
                subscriber_status = None

            comments.append({
                'author': comment['authorDisplayName'],
                'updated_at': comment['publishedAt'],
                'like_count': comment['likeCount'],
                'text': comment['textOriginal'],
                'public': public,
                'is_subscriber': subscriber_status
            })

    df = pd.DataFrame(comments, columns=['author', 'updated_at', 'like_count', 'text', 'public', 'is_subscriber'])
    df.to_csv("comments.csv")

    return df

# Function to get subscriber status using the YouTube Data API
def get_subscriber_status(youtube, author_id):
    request = youtube.channels().list(
        part="snippet",
        id=author_id
    )
    response = request.execute()
    return response['items'][0]['snippet']['description']


from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

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

