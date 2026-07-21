# SPECIFICATION: AquaBond – A Couple's Hydration App

## 1. Document Overview
This document serves as the Software Requirements Specification (SRS), Product Requirement Document (PRD), and Technical Architecture design for **AquaBond**—a premium, cozy, and emotionally engaging couple's hydration tracker.

---

## 2. Product Requirement Document (PRD)

### 2.1 Product Vision
AquaBond transforms the clinical chore of drinking water into a shared, cozy, and emotionally connective ritual for couples. By binding two people's hydration goals together through real-time synchronization, delightful animations, customizable companion pets, and adaptive weather-based targets, AquaBond turns accountability into play.

### 2.2 Target Audience
* **Romantic Couples (Co-habitating & Long-Distance):** Seeking soft connection touchpoints throughout their busy days.
* **Close Friends & Family Members:** Looking for cozy accountability circles.
* **Wellness Enthusiasts:** Wanting a premium, customizable, non-clinical hydration tracker.

### 2.3 Feature Matrix & Release Phases

| Feature Module | MVP (v1.0) | Core Release (v1.5) | Future Expansion (v2.0) |
| :--- | :---: | :---: | :---: |
| **Daily Intake Logging** | Manual logging, quick presets, units (ml/oz), reset/delete | Edit previous entries, history list | Custom beverage types (tea, coffee, juice) with hydration indexes |
| **Couple Syncing** | Real-time drink syncing, invite codes, shared progress | Streaks, last-logged statuses, interactive reminders | Mini-games, shared water-garden growing, custom drawing widgets |
| **Animated Bottle** | Smooth filling wave animation, percentage indicator | Glassmorphic overlay, floating bubbles | Custom seasonal bottle skins, unlockable designs |
| **Cute Companion** | 5 emotional states (sleepy to celebrating), custom name | Personalized reminder custom quotes, interactive touch reactions | Custom outfits, accessory store (using free streak XP) |
| **Weather Hydration** | Open-Meteo integration, manual toggle, basic temperature adjust | Humidity and heat-index adjusts, conversational reasoning | Activity/sensor sync (Apple Health, Google Fit) |
| **Smart Reminders** | Interval reminders, wake/sleep limits, quiet hours | Partner-triggered customized reminders, snooze options | Intelligent machine-learning reminder timing based on usage patterns |
| **Widgets** | - | Small & Medium Home-screen Widgets | Large Widget, interactive lock-screen widgets |
| **Gamification** | Leveling (XP), basic achievements | Group streaks, unlockable color themes, seasonal badges | Co-op milestones, printable couple certificates |
| **Statistics & History**| Daily & Weekly bar charts, average intake | Monthly heatmap, monthly/yearly graphs | Predictive consumption analytics, PDF export |
| **Aesthetic Themes** | Light & Dark modes, Sakura, Mint, Blue accents | AMOLED dark mode, Lavender, Peach, Pink | Dynamic ambient themes matching local weather and companion mood |

---

## 3. Technical Architecture Design

### 3.1 Technology Stack
* **Frontend Framework:** Flutter (Stable) — targets Android and iOS with a single, performant, canvas-rendered codebase.
* **UI/Design Paradigm:** Material 3 meets Apple Human Interface Guidelines with deep customization. Customized using custom widgets for glassmorphic cards, custom painters for waves, and spring physics.
* **State Management:** Riverpod — for safe, robust, compile-time-safe state caching, asynchronous family providers, and clean viewmodel modularization.
* **Local Storage:**
  * `Hive CE` (Community Edition): Lightweight, ultra-fast NoSQL binary key-value storage for offline drink logs and cache metadata.
  * `shared_preferences`: For quick key-value local state flags (e.g., active theme, onboarding completed).
* **Backend Platform:** Firebase (Spark Plan - Free Forever limits):
  * **Firebase Authentication:** Handles passwordless email signing, Google Sign-In, and anonymous accounts linking.
  * **Cloud Firestore:** Document database utilizing offline persistence enabling flawless offline-first CRUD operations and instant real-time websocket-like listeners.
  * **Firebase Cloud Messaging (FCM):** For sending immediate system, streak-completion, and couple-trigger notifications.
  * **Firebase Analytics, Crashlytics, & Remote Config:** Free-tier crash reporting, feature toggling, and telemetry.
* **Weather API:** **Open-Meteo API** (Completely Free, No API Key required, non-commercial and open-commercial usage limits, high-precision GPS-based weather fetching).

---

### 3.2 System Topology & Synchronization Flow
Below is the system synchronization blueprint:

```
[Local App User A] <---> [Local SQLite / Hive Cache]
         |
    (Riverpod)
         |
  [Firestore Sync Layer (Offline-First)]
         ^
         | (Secure Websockets / Firestore Live Stream)
         v
  [Cloud Firestore] <=== (Cloud Functions / FCM) ===> [Partner App User B]
         ^
         | (HTTP REST JSON)
  [Open-Meteo Weather API]
```

---

## 4. Database Schema (Cloud Firestore)

Firestore is modeled as highly optimized documents, leveraging subcollections for log scalability to respect Spark Plan storage limits.

### 4.1 Collection: `users`
* `/users/{userId}` (Document)
```json
{
  "uid": "String (Primary Key)",
  "displayName": "String",
  "email": "String",
  "createdAt": "Timestamp",
  "partnerId": "String (Nullable, index for matching)",
  "coupleId": "String (Nullable, joins two users)",
  "dailyGoalMl": "Number (Default 2000)",
  "unit": "String ('ml' or 'oz')",
  "timezone": "String",
  "weatherGoalEnabled": "Boolean (Default false)",
  "latitude": "Number (Nullable)",
  "longitude": "Number (Nullable)",
  "companion": {
    "type": "String ('drop' | 'bunny' | 'penguin' | 'cat' | 'blob' | 'axolotl')",
    "name": "String",
    "colorTheme": "String ('sakura' | 'mint' | 'blue' | 'lavender' | 'pink' | 'peach')",
    "skinId": "String",
    "outfitId": "String"
  },
  "streak": {
    "current": "Number",
    "longest": "Number",
    "lastDrankAt": "Timestamp"
  },
  "reminderSettings": {
    "intervalMinutes": "Number (Default 120)",
    "wakeTime": "String ('08:00')",
    "sleepTime": "String ('22:00')",
    "quietHoursEnabled": "Boolean (Default true)",
    "quietStart": "String ('22:00')",
    "quietEnd": "String ('08:00')",
    "customQuotes": "Array of Strings",
    "vibrationEnabled": "Boolean",
    "soundName": "String"
  },
  "xp": "Number",
  "level": "Number",
  "unlockedSkins": "Array of Strings",
  "unlockedOutfits": "Array of Strings"
}
```

### 4.2 Collection: `couples`
* `/couples/{coupleId}` (Document)
```json
{
  "id": "String (Primary Key)",
  "userAId": "String",
  "userBId": "String",
  "connectedAt": "Timestamp",
  "coupleStreak": "Number",
  "sharedStats": {
    "totalVolumeDrankMl": "Number",
    "daysGoalMetTogether": "Number"
  },
  "activeChallengeId": "String (Nullable)"
}
```

### 4.3 Subcollection: `water_logs`
* `/users/{userId}/water_logs/{logId}` (Document)
```json
{
  "id": "String",
  "amountMl": "Number",
  "timestamp": "Timestamp",
  "measurementUnit": "String ('ml' | 'oz')",
  "sourceDevice": "String ('android' | 'ios' | 'widget')",
  "cupType": "String ('cup' | 'glass' | 'bottle' | 'custom')"
}
```

### 4.4 Subcollection: `couple_messages`
* `/couples/{coupleId}/messages/{messageId}` (Document)
* Lightweight interaction log (hugs, pokes, customization notes)
```json
{
  "id": "String",
  "senderId": "String",
  "type": "String ('nudge' | 'sparkle' | 'heart' | 'custom_cheer')",
  "content": "String (Custom reminder or cheer sentence)",
  "timestamp": "Timestamp"
}
```

---

## 5. Security Rules (`firestore.rules`)

To comply with Firebase Spark Security and maintain bulletproof isolation, we declare rules constraining data viewing purely to authenticated users who are directly connected as couples.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function getPartnerId(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.partnerId;
    }

    function isPartnerOf(userId) {
      return isAuthenticated() && (request.auth.uid == getPartnerId(userId));
    }

    // User Profile Access
    match /users/{userId} {
      allow read: if isOwner(userId) || isPartnerOf(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || 
        (isPartnerOf(userId) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['partnerId', 'coupleId'])); // partner linking
      allow delete: if isOwner(userId);
      
      // Drink logs access
      match /water_logs/{logId} {
        allow read, write: if isOwner(userId) || isPartnerOf(userId);
      }
    }

    // Couples Access
    match /couples/{coupleId} {
      allow read, write: if isAuthenticated() && 
        (request.auth.uid == resource.data.userAId || request.auth.uid == resource.data.userBId);
      allow create: if isAuthenticated() && 
        (request.auth.uid == request.resource.data.userAId || request.auth.uid == request.resource.data.userBId);
        
      match /messages/{messageId} {
        allow read, write: if isAuthenticated() && 
          (request.auth.uid == get(/databases/$(database)/documents/couples/$(coupleId)).data.userAId || 
           request.auth.uid == get(/databases/$(database)/documents/couples/$(coupleId)).data.userBId);
      }
    }
  }
}
```

---

## 6. Weather-Based Hydration Logic

### 6.1 API Evaluation

| Metric | Open-Meteo | WeatherAPI | OpenWeatherMap |
| :--- | :--- | :--- | :--- |
| **API Key Requirement** | None (Public CORS Endpoint) | Required (Free signup) | Required (CC required for OneCall 3.0) |
| **Cost** | Completely Free (No limit on fair-use) | Limited free tier (1M/mo) | Limited free tier (1000/day) |
| **Data Quality** | National Meteorological sources | Combined sources | Proprietary models |
| **Best Choice** | **Yes (Selected)** | Alternative | Overkill / Complex signup |

### 6.2 Suggested goal formula based on weather factors:
Let $BaseGoal$ be the default goal of the user (e.g., $2000$ ml).

$$\text{Hydration Adjust}(mL) = \text{Temp Adjust} + \text{Humidity Adjust}$$

1. **Temperature Adjust ($T$ in °C):**
   * If $T \le 22^\circ\text{C}$: $0$ mL.
   * If $22^\circ\text{C} < T < 30^\circ\text{C}$: $+ (T - 22) \times 30$ mL.
   * If $T \ge 30^\circ\text{C}$: $+ (T - 22) \times 45$ mL (capped at $+800$ mL).

2. **Humidity Adjust ($H$ in %):**
   * If $H < 30\%$ (Dry air increases skin transpiration): $+200$ mL.
   * If $H \ge 85\%$ and $T \ge 28^\circ\text{C}$ (High heat index, difficult sweat vaporization): $+300$ mL.

3. **Total Recommendation:**
   $$Goal = \text{BaseGoal} + \text{Hydration Adjust}$$

*Conversational reasoning generated at load:*
> "Today's weather is hot (31°C) and dry (25% humidity), so your recommended goal has adjusted from 2.0L to 2.5L to ensure you stay properly hydrated."

---

## 7. UI/UX Flow & Wireframes

### 7.1 Aesthetic Style & Mood Board
* **Palette:** Ultra-soft pastels (Sakura Rose, Mint Sage, Cozy Peach, Ocean Slate, Lavender Fields). Soft, cozy rounded borders (`border-radius: 24px` / `32px` on cards).
* **Styling Techniques:** Gentle glassmorphic surfaces using frosted-glass blurs (`BackdropFilter`), organic custom wave shapes, and cute hand-drawn vector elements.
* **Micro-interactions:** Staggered list reveals, spring-overshoot scroll behaviors, and responsive tactile bubble popping when tapping buttons.

### 7.2 Main Screen Wireframe Structure
```
+-----------------------------------------------------------+
| [Profile / Settings]                    [Theme Selector]  |
|                                                           |
|             "AquaBond" (Elegant Serif Typography)         |
|                                                           |
|               [CUTE COMPANION SVG ANIMATION]              |
|              "Boba is sleepy... (15% completed)"          |
|                                                           |
|                  +---------------------+                  |
|                  |      ~~~ ~~~        |                  |
|                  |     ~ ~ ~ ~ ~       |  <-- GLASSMOPRH  |
|                  |    ~ WATER ~~~      |      BOTTLE      |
|                  |    ~~~~~~~~~~~      |      WAVE        |
|                  |    520 ml / 2000 ml |      ANIMATION   |
|                  +---------------------+                  |
|                                                           |
|       [+250ml Cup]    [+500ml Bottle]   [+ Custom]        |
|                                                           |
| +-------------------------------------------------------+ |
| | COZY COUPLE RAIL                                      | |
| | [Partner Avatar] "Lina is hydrated! (80% completed)"  | |
| | Streak: 12 Days 🔥   |   Shared Vol Today: 2.1L        | |
| | [Poke Partner ❤️]  [Send Custom Cheer Message 💬]      | |
| +-------------------------------------------------------+ |
|                                                           |
| [Dashboard]      [Statistics]      [Themes]      [Social] |
+-----------------------------------------------------------+
```

---

## 8. Animation & Interaction Specification

* **Wave Animation Physics:**
  * Double-layered sine-wave custom painters moving in counter directions to create visual depth:
    $$y_1(x) = A \sin(kx - \omega t) + h$$
    $$y_2(x) = A \cos(kx + \omega t - \phi) + h$$
  * Where $A$ is the wave amplitude ($8\text{dp}$ to $12\text{dp}$), $h$ is the percentage-filled height, and $\omega$ is the dynamic speed representing the partner's activity.
* **Button Pop Spring Physics:**
  * Uses overshoot spring dynamics: `damping: 15`, `stiffness: 120`, `mass: 1`. When pressed, scale shrinks to $0.92$, then bounces beautifully to $1.04$ before settling on release.
* **Goal Achievement Sparkle:**
  * Spawns dynamic particle physics emitters at the bottle location. Over 2 seconds, 30 pastel particles scatter with random initial velocities, spinning shapes, and alpha decay to $0$.

---

## 9. Notification Strategies

1. **User Nudges (Internal FCM Trigger):**
   * Actionable payload containing quick actions:
     `{"click_action": "FLUTTER_NOTIFICATION_CLICK", "type": "nudge", "sender": "partner_uid"}`
   * UI displays interactive custom buttons: "Drank 250ml", "Snooze 15m", "Send Heart Back".
2. **Cooperative Milestones:**
   * Triggered when both reach 100% goals simultaneously:
     *"Double Goal Met! Boba & Mocha are high-fiving! 🌟"*

---

## 10. Home-Screen Widgets Specification

### Small Widget (2x2)
* Displays dynamic glassmorphic bottle vector with live percentage ring and cozy companion profile thumbnail. Updates via background fetch services triggered by partner logs.

### Medium Widget (4x2)
* Left Panel: Custom bottle wave graphic and daily progress ratio.
* Right Panel: Partner progress avatar, streak icon, and two immediate quick-add buttons (+250ml and +500ml).

---

## 11. Implementation Roadmap

### Phase 1: Local Foundations (Week 1)
* Project setup, asset generation, Google Fonts import.
* Riverpod state architecture & Hive local schema setup.
* Wave custom painter design and companion animation curves.

### Phase 2: Weather & Hydration Engine (Week 2)
* Open-Meteo REST service integration.
* Adaptive formula, local notifications schedule scheduler.
* Wireframe translation to fluid responsive UI screens.

### Phase 3: Connected Couple Sync (Week 3)
* Firestore backend connection, QR code generator & reader.
* Real-time listeners, Firestore security rules enforcement.
* Cloud Messaging integration and quick action notifications.

### Phase 4: Gamification, Themes, & Polishing (Week 4)
* XP logic, achievements unlocks, customized themes engine.
* Home-screen widget bindings (Android/iOS).
* Haptic feedbacks, QA verification, and final presentation.
