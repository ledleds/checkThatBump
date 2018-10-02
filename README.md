# check-that-bump

A GitHub App built with [Probot](https://probot.github.io) that listens for a new or reopened pull request and reads from the diff from the package.json to see if the version has been incremented on an open PR. If it has not, it will request changes on your PR and leave a comment. 

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how check-that-bump could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Victoria Ledsom <victorialedsom@gmail.com>
