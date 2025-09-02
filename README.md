# CartTracker 🚎📍

A real-time cart ride tracking system built with **React Native**, designed to improve transparency between **riders** and **cart operators** in my society.

https://github.com/user-attachments/assets/ee8a4f9f-4622-4ee8-832e-b81aa3211e98

---

## 📌 Problem Statement

In my current residence, **passengers have little to no visibility** into:
- Where the cart is currently located  
- How long it will take to reach them  
- Whether their ride has been accepted by an operator  

On the other hand, **cart operators struggle** with efficiently managing multiple ride requests, often lacking a clear interface to prioritize or track passengers.

This leads to:
- Confusion and frustration for riders  
- Operational inefficiency for operators  
- Missed or delayed rides  

---

## 💡 Solution

CartTracker provides **two dashboards**:

### 🧍 Rider Dashboard
- After a ride is accepted, the rider sees the **live location of the cart** on the map  
- Path updates in real time, showing **ETA** and **movement tracking**  

### 🛺 Operator Dashboard
- Before accepting, operators see a **map of incoming ride requests** as red markers  
- Once a request is accepted, it turns **green** (still visible on the map for tracking)  
- Operators can manage **multiple rides at once** without being forced into navigation mode  

---

## 🔮 Upcoming Features

- **Voice AI Agent (WIP)**:  
  Operators will be able to **hear passenger requests in natural language** (e.g., *"I want to go to the gym"*).  
  - Riders speak their destination  
  - Voice AI converts speech into structured intent  
  - Operator dashboard surfaces it clearly along with the ride request  

This makes communication smoother, especially in noisy environments or where typing is inconvenient.

---

## 🛠️ Tech Stack

- **React Native** (cross-platform mobile app)  
- **react-native-maps** (map visualization, markers, live tracking)  
- **react-native-geolocation-service** (location tracking via Fused + LocationManager fallback)  
- **Google Play Services Location API**  
- **TypeScript** (hooks, services, and typed APIs)  

---

## ⚙️ Key Implementation Notes
 
- Cached location (up to 2 minutes old) is used to **reduce GPS polling and save battery**.  
- Operators don’t see turn-by-turn navigation (to avoid clutter) — only **colored markers** for requests.  

---

