# discord-typescript-template

This is an object oriented Typescript template for a Discord.js bot.

The bot comes with the following features:

- Support for both slash and text commands
- Uses Enmap.js for its database
- Custom logging
- Production and non production modes
- Docker containers for prod and non-prod
- A Makefile file for easily building and running the docker containers
- Prettier config file
- Eslint config

## Usage

Feel free to either fork this repo and build your bot off of it or download the download the code and use it as the starting point for your project.

## Configuration

There is a configuration file stored in src/config. In that directory there is a sample file, which can be either copied to or renamed to `config.json`. In this file there are the following fields:

- Production mode
  - token
    - The token for the bot to be used in production mode
  - prefix
    - The prefix to be used for text commands in production mode
- Non production mode
  - token
    - The token for the bot to be used in non-production mode
  - prefix
    - The prefix to be used for text commands in non-production mode
  - guildId
    - The id of the guild to be used for when registering slash commands in non-production mode

## Docker

There are 2 docker containers included, one for production (Dockerfile) and one for non-production(dev-Dockerfile).

### Production

The Dockerfile for this container will build the Typescript in a builder stage and then copy the Javascript code to a runner image. This helps keep the size down by not needing to have the dev dependencies installed.

The docker-compose.yml file will build and run the container as well as create a volume for the database files.

### Non-Production

The dev-dockerfile file for this container will not build the typescipt. It only installs the production and dev dependencies.

The dev-docker