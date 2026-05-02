# ไปไหนดี (Pai Nai Di)
This project is part of a 24hr hackathon of the SuperAI Engineer Season 6 (SS6) program. The task is to develop a website to solve a real problem that I personally encountered.

My pain point is that planning a trip in Thailand can be incredibly overwhelming. With so many provinces, attractions, and options, I often find myself with hundreds of open tabs, reading endless reviews, and still struggling to piece together a coherent itinerary. The sheer volume of generic information makes it difficult to decide where to go, leading to "analysis paralysis" and a lot of wasted time.

Based on this problem I developed *ไปไหนดี (Pai Nai Di)*, a Tinder-style swipeable travel recommendation web application integrated with a smart RAG (Retrieval-Augmented Generation) AI. The system simulates a dating app experience but for tourist attractions. Users can discover places, swipe right to add them to their favorites, and swipe left to skip. 

The website also includes features such as filtering by province and category, taking personalized notes on favorite locations, one-click Google Maps navigation, and most importantly, an integrated AI Travel Companion. The AI specifically reads from the user's customized "favorites list" to intelligently answer questions, suggest 1-day trip plans, and provide personalized travel advice based exclusively on the places the user genuinely likes.

## PC & Mobile Showcase (Responsive Supported)
<img src="screenshot/screenshot.gif" alt="Desktop Portfolio">

## 🛠️ Tech Stack
- Front-end: Next.js (TypeScript), React, TailwindCSS, Framer Motion
- Back-end: Next.js (Node.js/TypeScript), OpenAI SDK (Typhoon V2.5 30B LLM)
- Database: MySQL

## Installation With docker

### 1. Open Docker Desktop
```
Make sure Docker Desktop is running on your machine.
```

### 2. Git clone this repo
```bash
git clone https://github.com/ssrpsx/thailand-painaidi-rag-web.git
```

### 3. Move to the project directory
```bash
cd thailand-painaidi-rag-web
```

### 4. Download Image Dataset (Important!)
Due to file size limits, the image dataset is hosted externally.
*(Note: Without this dataset, the application will still work but **NO images** will be displayed.)*
1. Download `data.zip` from your Google Drive link (Check `.env.example` or ask the repository owner for the link).
2. Place the downloaded `data.zip` inside the `db/` folder of this project before proceeding.

### 5. Build docker compose
```bash
docker compose up --build -d
```

### 6. Waiting until to see this in docker logs
```
✓ Ready in ...
```

### 7. Open the website in your browser
```bash
http://localhost:3000/
```

dataset: https://datacatalog.tat.or.th/en/dataset/tourist-attraction <br>
*(Note: The system uses a cookie-based UUID for anonymous sessions instead of a traditional login, so you can start swiping right away!)*
