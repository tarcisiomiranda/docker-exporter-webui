IMAGE_NAME=docker-export-web
PORT=8080
VITE_API_BASE_URL ?= http://localhost:9090

build:
	docker build --build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) -t $(IMAGE_NAME) .

run:
	docker run -d -p $(PORT):80 --name $(IMAGE_NAME) $(IMAGE_NAME)

stop:
	docker stop $(IMAGE_NAME) && docker rm $(IMAGE_NAME)

clean:
	docker rmi $(IMAGE_NAME)

logs:
	docker logs -f $(IMAGE_NAME)

ps:
	docker ps --filter "name=$(IMAGE_NAME)"

restart: stop run
