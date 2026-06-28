# Connection Control Web Server Model (Red & Blue Buttons)

A full Client-Server web model designed to demonstrate system-to-system connections over a local network. Using a premium, dark-themed frontend with glassmorphic cards, this model provides real-time connection status visualization.

- **Frontend (Client)**: HTML/CSS/JS with configuration input, connection status badges, and large **Red** (Establish) & **Blue** (Release) buttons.
- **Backend (Server)**: A Node.js application built with Express and WebSockets that prints color-coded, real-time connection establishment and release logs.

---

## 🛠️ System Prerequisites

1. **Node.js** (v14 or higher) must be installed on the **backend laptop**.
2. **Network Connection**: Both the frontend laptop (Laptop A) and backend laptop (Laptop B) must be connected to the **same local network** (e.g., the same Wi-Fi connection).

---

## 💻 1. Backend Setup (Laptop B)

1. Open your terminal/command prompt and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. On startup, the console will print your local network IP addresses, looking similar to this:
   ```text
   ==================================================
   🔌 CONNECTION CONTROL SERVER STARTED
   ⏰ Time: 2026-06-25 13:15:30
   📡 Server listening on port: 8080
   --------------------------------------------------
   🌐 To connect from another laptop on the same network,
      use one of these WebSocket URLs on the frontend:
      👉 ws://192.168.1.15:8080
      👉 ws://localhost:8080 (local machine only)
   ==================================================
   ```
   **Note down the IP address printed on your screen (e.g., `192.168.1.15`).**

---

## 🌐 2. Frontend Deployment (GitHub Pages or Local)

### Option A: Local Run (Laptop A)
Simply open the `frontend/index.html` file in any modern web browser on Laptop A.

### Option B: Deploy to GitHub Pages
To host the frontend on GitHub and access it anywhere:
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initialize connection control model"
   ```
2. Create a new repository on your GitHub account (e.g., `connection-control`).
3. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/connection-control.git
   git branch -M main
   git push -u origin main
   ```
4. Enable GitHub Pages:
   - Go to your repository settings on GitHub.
   - Click on **Pages** in the left sidebar.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Choose your branch (e.g., `main`) and folder (usually `/ (root)` or choose `/frontend` if you structure your pages there) and click **Save**.
5. After a minute, GitHub will provide a public URL for your page (e.g., `https://YOUR_USERNAME.github.io/connection-control/frontend/`). Open this link on Laptop A.

---

## 🧪 3. How to Perform the Test

1. Ensure the **Backend** is running on Laptop B.
2. Open the **Frontend** page in a web browser on Laptop A.
3. In the **Server Address** text input on Laptop A, type the WebSocket URL of Laptop B (e.g., `ws://192.168.1.15:8080`).
4. **Click the RED button** ("Establish Connection") on Laptop A:
   - **On Laptop A (Frontend)**: The status badge changes to a glowing green **Connected** state, and the console shows connection success logs.
   - **On Laptop B (Backend Console)**: You will see a red log output indicating connection:
     ```text
     [2026-06-25 13:16:10] 🔴 CONNECTION ESTABLISHED from client [IP: ::ffff:192.168.1.20]
     ```
5. **Click the BLUE button** ("Release Connection") on Laptop A:
   - **On Laptop A (Frontend)**: The status badge returns to a grey **Disconnected** state, and the console logs show connection release.
   - **On Laptop B (Backend Console)**: You will see a blue log output indicating release:
     ```text
     [2026-06-25 13:16:45] 🔵 CONNECTION RELEASED from client [IP: ::ffff:192.168.1.20] (Code: 1000)
     ```
