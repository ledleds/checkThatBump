# check-that-bump

A GitHub App built with [Probot](https://probot.github.io) that listens for a new or reopened pull requests within your Node project and reads from the diff from the package.json to see if the version has been incremented on an open PR. If it has not, it will suggest changes on your PR and leave a comment. 

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## License

[ISC](LICENSE) © 2018 Victoria Ledsom <victorialedsom@gmail.com>
