# 13th Floor - Fireguard.ai

![13th floor](https://github.com/KeonJukes/Thirteenth-Floor-Fireguard-AI/blob/main/fire-logo-favicon.png)

![Cerebral Valley Hackathon](https://img.shields.io/badge/Cerebral%20Valley-Gemini%20Hackathon-blue)
![Gemini API](https://img.shields.io/badge/Powered%20by-Gemini%20API-purple)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6)

**A Next-Generation Fire Safety & Resident Management Application**

_Project created by **Keon Jukes** for the Cerebral Valley Gemini Hackathon._

---

## 1. The Problem with Fire Alarms

Traditional fire alarm systems in apartment buildings are archaic. They are loud, impersonal, and often terrifying, causing panic rather than providing clear, actionable guidance. When a resident is trapped or disoriented, the blaring siren offers no help, no information, and no reassurance. There is a critical gap in communication during the most vital moments of an emergency.

## 2. The Solution: Fireguard.ai

**13th Floor** is a prototype application that redefines the resident experience during a fire emergency. It moves beyond the simple alarm and provides a comprehensive, intelligent, and interactive safety net for every resident. By leveraging the advanced multimodal and conversational capabilities of the Google Gemini API, Fireguard.ai turns a moment of panic into a guided, informed, and calmer evacuation process.

The core innovation is the **Gemini Live Distress Signal**, which transforms the terrifying experience of being trapped during a fire into a direct, real-time conversation with an AI emergency dispatcher who already knows who and where you are.

## 3. Key Features

-   **Resident Profile Management**: Securely store essential information like apartment number, floor, number of tenants, and emergency contacts.
-   **AI-Powered Fire Monitoring**: (Powered by **Gemini 2.5 Flash**) Users can upload security camera footage, and the AI will analyze it frame-by-frame, logging any signs of fire or smoke and triggering an alert.
-   **Personalized 3D Evacuation Routes**: When a fire is detected, the app generates a dynamic 3D visualization of the building, showing the fire's location, the resident's location, and a clear, safe path to the nearest exit.
-   **Live Emergency Responder Tracking**: A mock interface shows the real-time location and ETA of dispatched fire department units, reducing uncertainty.
-   **Voice-Controlled Navigation**: Hands-free control allows users to navigate through the app's different sections using simple voice commands.
-   **Fire Safety Guidelines**: A dedicated section provides residents with essential fire safety tips and procedures.

## 4. The Gemini Live API: A New Fire Alarm Experience

The cornerstone of the application is the **Distress Signal** page, which utilizes the **Gemini 2.5 Flash Native Audio (Live API)** to create a new paradigm for emergency communication.

### How It Works:

When a resident feels trapped or needs immediate assistance, they can activate the "Distress Signal". Instead of just a siren, this initiates a live, two-way audio and text conversation with a Gemini-powered AI dispatcher.

1.  **Instant, Proactive Contact**: The moment the session starts, Gemini speaks first. It doesn't wait for the panicked user to talk. It immediately provides reassurance and confirms their identity and location, using the data from their resident profile.
    > *"This is the emergency line. We've received your distress signal from apartment 4B on floor 4. Help is on the way. Can you tell me what's happening? Are you safe right now?"*

2.  **Real-Time, Conversational Support**: The resident can speak naturally, and their words are transcribed in real-time. Gemini listens and responds with a calm, guiding voice, providing instructions, keeping them on the line, and gathering critical information (e.g., "Is the smoke thick?", "Can you get low to the ground?").

3.  **Reduced Panic, Increased Safety**: This human-like interaction is designed to be calming. It provides a focal point for the resident, helping them manage their fear while the AI relays simulated updates and gathers information that could be vital for first responders.

4.  **Accessibility**: For residents who cannot speak, the system is fully integrated with a text chat, allowing them to type their messages and receive spoken audio responses from the dispatcher.

This feature transforms the fire alarm from a loud, impersonal warning into a personal, intelligent, and life-saving conversation.

## 5. Technology Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **3D Visualization**: Three.js
-   **AI & Core Logic**:
    -   **Google Gemini 2.5 Flash (Vision)**: For the fire monitoring video analysis.
    -   **Google Gemini 2.5 Flash Native Audio (Live API)**: For the real-time AI dispatcher in the Distress Signal feature.
