## WORKING ON 
Booking system – Users can reserve spots for events; enforce capacity limits using MongoDB atomic updates.

BullMQ for async tasks – Send confirmation emails, update inventory, and trigger post-purchase workflows via jobs.

Live attendee count – Use Redis to store and increment attendee counts; push updates via WebSockets.

Jenkins pipeline – Build, test, and deploy Docker images to a registry (Docker Hub, ECR). Include stages for linting, unit/integration tests, security scanning (Trivy), and deployment to staging/production.

Environment parity – Use Docker Compose for local development that mirrors production.
