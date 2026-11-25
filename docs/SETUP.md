# Setup Guide

## A. Run tests
```bash
cd backend && npm ci && npm run lint && npm run test:coverage
# HTML report: backend/coverage/index.html
```

## B. Docker Compose
```bash
docker compose up --build -d
docker compose --profile seed run --rm seed     # creates demo users
# Frontend: http://localhost:3000   API docs: http://localhost:5000/api-docs
docker compose down
```

## C. Kubernetes (minikube)
```bash
minikube start
# Option 1: use images from GHCR (make them public, or create an imagePullSecret)
# Option 2: build into minikube:
eval $(minikube docker-env)
docker build -t ghcr.io/sellwane7/deskflow-backend:latest ./backend
docker build -t ghcr.io/sellwane7/deskflow-frontend:latest ./frontend

kubectl apply -f k8s/
kubectl -n deskflow get pods,svc
kubectl -n deskflow run seed --rm -it --restart=Never \
  --image=ghcr.io/sellwane7/deskflow-backend:latest --image-pull-policy=IfNotPresent \
  --env MONGO_URI=mongodb://mongo:27017/deskflow -- node seed.js

# Two terminals (the frontend calls the API at localhost:5000):
kubectl -n deskflow port-forward svc/backend 5000:5000
kubectl -n deskflow port-forward svc/frontend 3000:3000
```

Change the `JWT_SECRET` in `k8s/20-backend.yaml` before real use.
