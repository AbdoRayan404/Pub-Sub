# Pub-Sub
Simple implementation of Pub-Sub pattern in NodeJS with WS module

# Pattern used
![pattern](https://i.imgur.com/EfYWe6h.png "pattern")

# Tech used
- NodeJS
- Docker
- NPM

# How to run the Docker image?
```
Docker run -p {PUB-PORT}:8080 -p {SUB-PORT}:8181 --name pubsub -d {image Name}
```
# Configurations needed.
- .env with PUB_PASSWD={VALUE}
- topics.json (if needed)

# Configurations Info
- "max-subs" in topics.json can be set to unlimited by making it -1
- "sub-passwd" in topics.json can be set to none by making it ""