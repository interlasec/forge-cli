# Forge CLI

Command line interface (CLI) to help create, manage, and deploy Forge apps.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials
explaining Forge.

## Requirements

You need the following:
- [Node.js](https://nodejs.org/en/download/): The Forge CLI requires an [LTS version](https://nodejs.org/en/about/releases) of Node JS installed. We recommend that you install Node JS via [Node version manager](https://github.com/nvm-sh/nvm#installing-and-updating).

_Important:_ We recommend running Node under your user. If you're running node under root privilege instead, you'll need to update the Node configuration to allow global module installs using binaries by running:
```
npm config set unsafe-perm true
```

To check your Node version, run the following in the terminal:
```
node --version
```

- [Docker](https://docs.docker.com/get-docker/) (version 17.03 or later).

To check your Docker version, run the following in the terminal:

```
docker --version
```

See [Getting started](https://developer.atlassian.com/platform/forge/getting-started/) for instructions to get set up.

## Installation

Install the CLI globally by running:
```
npm install -g @forge/cli
```

## Get started

Explore the help by running:
```
forge --help
```

This displays the list of available commands:
```
Usage: forge [options] [command]

Options:
  --version                              output the version number
  --verbose                              enable verbose mode
  -h, --help                             output usage information

Commands:
  autocomplete [options] [install|uninstall]  configures autocomplete for the Forge CLI
  create [options] [name]                     create an app
  deploy [options]                            deploy your app to an environment
  feedback [options]                          let us know what you think about Forge
  install [options]                           manage app installations
  lint [options]                              check the source files for common errors
  login [options]                             log in to your Atlassian account
  logout [options]                            log out of your Atlassian account
  logs [options]                              view app logs
  register [options] [name]                   register an app you didn't create so you can run commands for it
  settings [options]                          manage Forge CLI settings
  tunnel [options]                            start a tunnel to connect your local code with the app running in the
                                              development environment
  variables [options]                         manage app environment variables
  webtrigger [options] [installationId]       get a web trigger URL
  whoami [options]                            display the account information of the logged in user
  help [command]                              display help for command
```

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
