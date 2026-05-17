# BB84 Quantum Key Distribution - Interactive Explorer

## Overview
Welcome to the interactive web visualization of the **BB84 Quantum Key Distribution** protocol. This application was built to serve as the visual, accessible companion to my Physics Bachelor's Thesis at the Universitat de Barcelona. 

While the underlying cryptography relies on complex quantum mechanics and statistical modeling, this web app is designed to make those concepts interactive and understandable for technical and non-technical audiences alike. By bridging the gap between theoretical physics and intuitive UI design, this platform allows users to safely explore how quantum encryption reacts to eavesdropping and natural interference.

## Architecture
This project utilizes a modern decoupled architecture:
* **Frontend (JSX / React):** A responsive, interactive user interface that handles dynamic parameter inputs, real-time data visualization, and educational routing. 
* **Backend (Python):** Serves as the computational engine, wrapping the `qiskit_aer` quantum simulator and SciPy statistical models into an API that processes the heavy quantum workflows and returns JSON payloads to the frontend.

## Web Structure & Features
The application is currently divided into three core learning modules:

### 1. Introduction to Quantum Cryptography (Intro)
* An educational landing page explaining the fundamentals of qubits, superposition, and the theory behind the BB84 protocol.
* Visualizes the basic workflow between Alice (sender) and Bob (receiver).

### 2. The Ideal Scenario (Ideal Case)
* An interactive sandbox where users can run the BB84 protocol in a perfect, noise-free vacuum.
* **Interactive Elements:** Users can inject an Eavesdropper (Eve) into the channel and adjust her interception rate ($p$). The UI dynamically visualizes how Alice and Bob detect the intrusion through sifted key errors.

### 3. The Real-World Scenario (With Noise)
* Introduces environmental degradation (bit-flip and phase-flip errors) to the quantum channel.
* **Interactive Elements:** Users can tweak both Eve's presence and the environmental noise rate. The dashboard visualizes the statistical thresholding algorithm used to distinguish between natural noise and a malicious attack, complete with real-time probability graphs.

## Local Installation & Setup

Because this project features a decoupled architecture, you will need to run both the backend server and the frontend development environment.

### Backend Setup (Python)
1. Navigate to the backend directory:
   ```bash
   cd backend
2. Install the required Python dependencies (it is recommended to use a virtual environment):
   ```bash
   pip install -r requirements.txt
3. Start the backend API server:
   ```bash
   uvicorn main:app --reload --port 8000
### Frontend Setup (Node.js / JSX)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
2. Install the required Node modules:
   ```bash
   npm install
3. Start the development server:
   ```bash
   npm run dev
4. Open http://localhost:3000 to view it in your browser.
