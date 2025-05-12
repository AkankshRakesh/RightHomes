# 🏡 RightHome AI — Co-Pilot MVP

An AI-powered property discovery assistant built using V0.dev and Next.js. This MVP mimics a co-pilot-style interface enabling **both chat and voice-based interactions** to help property buyers in **India and UAE** search, shortlist, and schedule property visits.

---

## 🖇️ Live Demo

👉 https://righthomes.vercel.app/

---

## 📌 Project Overview

RightHome AI is a smart assistant that helps users:
- Chat or talk about their property needs.
- Discover real estate projects based on preferences.
- Schedule calls or site visits.
- Seamlessly interact through a dynamic conversational UI.

---

## 💡 Features

- ✅ Co-pilot style **conversational UI** with both **chat and voice**
- ✅ Microphone input powered by **Web Speech API** + Gemini
- ✅ Smart recommendations using **mock builder data**
- ✅ Dynamic UI panels (property cards, dialogs, suggestions)
- ✅ Captures user **requirement map** through interaction
- ✅ Responsive UI and smooth transitions
- ✅ Modular and readable codebase (TypeScript + TailwindCSS)

---

## 🧠 Tech Stack

| Tech           | Role                              |
|----------------|-----------------------------------|
| Next.js 14     | React-based frontend framework    |
| TypeScript     | Type safety                       |
| Tailwind CSS   | Styling                           |
| Gemini API     | AI chatbot logic                  |
| Web Speech API | Voice recognition        |
| Calendly API   | Scheduling site visits or calls   |
| Firebase/MongoDB | Currently using dummy JSON to simulate database |
| V0.dev         | Low-code UI prototyping           |

---

## 🗺️ Conversation Flow

1. **Greeting**
2. **Buyer Intent + Preferences** (Budget, city, type)
3. **Smart Recommendations**
4. **Scheduling Options**
5. **Objection Handling**
6. **Summary + Follow-up**

Example prompts:
- _“Looking for a 3BHK in Gurgaon under 2 Cr”_
- _“Show me top builder projects in Dubai”_

---

## 🔧 Setup & Run Locally

### 1. Clone & Install
```bash
git clone https://github.com/your-username/akankshrakesh-assignmentv0.git
cd akankshrakesh-assignmentv0
npm install
```
### 2. Add env
```bash
NEXT_PUBLIC_GEMINI="xxxx"
```
### 3. Run using dev command
```bash
npm run dev
```
