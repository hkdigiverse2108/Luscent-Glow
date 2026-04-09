import requests
import json

def check_api():
    try:
        r = requests.get('http://127.0.0.1:5172/api/blogs/')
        if r.status_code == 200:
            posts = r.json()
            print(f"Number of posts: {len(posts)}")
            for i, post in enumerate(posts):
                print(f"\nPost {i+1}:")
                # print keys and types
                for k, v in post.items():
                    if k in ['_id', 'id', 'featured', 'title']:
                        print(f"  {k}: {v} (type: {type(v).__name__})")
        else:
            print(f"Error: {r.status_code}")
            print(r.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    check_api()
