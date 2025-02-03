# WebRTC Server Project

A WebRTC server implementation using Node.js and Kubernetes.

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

## Troubleshooting

If you encounter issues, you can:

1. **Check Pod Status**

   ```powershell
   kubectl get pods
   ```

2. **View Pod Logs**

   ```powershell
   kubectl logs -l app=webrtc-server
   ```

3. **Verify ConfigMap**
   ```powershell
   kubectl describe configmap ssl-certificates
   ```

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

## Project Structure
