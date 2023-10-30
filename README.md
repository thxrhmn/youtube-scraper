## INSTALL

```
git clone https://github.com/thxrhmn/youtube-scraper.git
cd youtube-scraper
npm install
```

## START SCRAPING

```bash
node index.js <youtube url> | <youtube playlist>
```

## EXAMPLES

```bash
node index.js https://www.youtube.com/playlist?list=PLRzwgpycm-Fio7EyivRKOBN4D3tfQ_rpu

# or

node index.js https://www.youtube.com/@JohnWatsonRooney/videos

```

## RESULT

```json
{
  "id": "PLRzwgpycm-Fio7EyivRKOBN4D3tfQ_rpu",
  "title": "-",
  "channelName": "John Watson Rooney",
  "channelURL": "https://youtube.com/@JohnWatsonRooney",
  "channelTotalVideos": "43",
  "viewers": "66.436 x ditonton",
  "lastUpdated": "27 Sep 2023",
  "totalVideos": 43,
  "videos": [
    {
      "id": "nCuPv3tf2Hg",
      "title": "Web Scraping with Python: Ecommerce Product Pages. In Depth including troubleshooting",
      "link": "https://youtube.com/watch?v=nCuPv3tf2Hg&list=PLRzwgpycm-Fio7EyivRKOBN4D3tfQ_rpu&index=1&pp=iAQB",
      "viewers": "128 rb x ditonton",
      "duration": "21.53",
      "published": "3 tahun yang lalu",
      "thumbnails": {
        "hd": "https://img.youtube.com/vi/nCuPv3tf2Hg/maxresdefault.jpg",
        "medium": "https://img.youtube.com/vi/nCuPv3tf2Hg/hqdefault.jpg",
        "low": "https://img.youtube.com/vi/nCuPv3tf2Hg/mqdefault.jpg"
      }
    }
  ]
}
```
