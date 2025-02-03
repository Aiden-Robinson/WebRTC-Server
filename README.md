# WebRTC Server Project

A WebRTC server implementation using Node.js and Kubernetes.

## Project Description

This project demonstrates real-time video streaming and interactive coordinate guessing using WebRTC. Here's how it works:

1. **WebRTC Connection**: The client establishes a secure WebRTC connection with the server using WebSocket signaling.

2. **Animation Generation**: The server runs a worker thread that generates a real-time animation of a blue ball bouncing within a canvas (640x480 pixels). This animation is continuously streamed to the client.

3. **Interactive Guessing Game**:

   - The client sees the streaming animation in their browser
   - Users can input their guess for the ball's X and Y coordinates
   - The server compares these guesses with the ball's actual position
   - The error (distance between guessed and actual position) is calculated and sent back to the client
   - The error is displayed on the client's interface in real-time

4. **Technical Features**:
   - Secure HTTPS/WSS communication using self-signed certificates
   - Worker thread implementation for smooth animation generation
   - Real-time bidirectional communication
   - Containerized deployment using Docker and Kubernetes
   - Canvas-based rendering for efficient video streaming

The project serves as a practical example of WebRTC streaming capabilities while incorporating interactive elements and real-time data exchange.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Deployment Instructions

1. **Start Docker Desktop**

   - Open Docker Desktop
   - Wait for it to fully start (the whale icon in your system tray should be solid)

2. **Start Minikube**

   ```powershell
   minikube start
   ```

3. **Point Docker CLI to Minikube's Docker daemon**

   ```powershell
   minikube docker-env | Invoke-Expression
   ```

4. **Build the Docker Image**

   ```powershell
   docker build -t webrtc-server:latest .
   ```

5. **Deploy to Kubernetes**

   ```powershell
   kubectl apply -f k8s-manifest.yaml
   ```

6. **Set up Port Forwarding**

   ```powershell
   kubectl port-forward service/webrtc-server-service 8000:8000
   ```

7. **Access the Application**
   - Open your web browser and navigate to:
   ```
   https://localhost:8000
   ```
   - Note: You'll see a certificate warning because we're using self-signed certificates.
     Click "Advanced" and then "Proceed" to access the application.

## Cleanup

To stop and clean up the deployment:

1. **Delete Kubernetes Resources**

   ```powershell
   kubectl delete -f k8s-manifest.yaml
   ```

2. **Stop Minikube**
   ```powershell
   minikube stop
   ```

