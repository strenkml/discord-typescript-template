prod:
	bash -c "sed -i 's/\"productionMode\": false,/\"productionMode\": true,/' src/config/config.json" && \
	docker compose -f docker-compose.yml -p discord-bot up --build -d

np:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/config/config.json" && \
	docker compose -f docker-compose.yml -p discord-bot up --build -d

dev:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/config/config.json" && \
	docker compose -f dev-docker-compose.yml -p dev-discord-bot up --build

