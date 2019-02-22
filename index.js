/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

const semver = require('semver');
const { comments } = require('./snark');

function findFile(files, fileToFind) {
  return files.data.filter(file => fileToFind === file.filename);
}

function requestChanges(context, issue, reviewComment = comments[Math.floor(Math.random() * comments.length)]) {
  context.github.pullRequests.createReview({
    ...issue,
    body: reviewComment,
    event: 'REQUEST_CHANGES',
  });
}

function checkVersionIsIncremented(string) {
  const originalVersion = string.match(/\-[\s]+\"version\":\ "([^\"]*)\"/);
  const changedVersion = string.match(/\+[\s]+\"version\":\ "([^\"]*)\"/);
  return semver.lt(originalVersion[1], changedVersion[1]);
}

function fileCheck(context, issue, foundFile) {
  // check for change to version in the diff
  const regex = new RegExp('[+]+ {2}"version"');
  const versionChange = regex.test(foundFile[0].patch);

  if (versionChange) {
    const isIncremented = checkVersionIsIncremented(foundFile[0].patch);

    if (!isIncremented) {
      const reviewComment = "Hey, are you sure you want to decrement the version? 👀";
      requestChanges(context, issue, reviewComment);
    }
    return;
  }
  requestChanges(context, issue);
}

function checkPullRequestForFile(context, issue, files) {
  const fileToFind = 'package.json';
  const foundFile = findFile(files, fileToFind);

  if (foundFile.length === 0) {
    // no change to the package.json
    requestChanges(context, issue);
  } else {
    fileCheck(context, issue, foundFile);
  }
}

module.exports = app => {
  console.log('Yay, the app was loaded!');

  app.on('pull_request.opened', async context => {
    app.log('Pull Request Opened!');
    const issue = context.issue();
    try {
      const files = await context.github.pullRequests.listFiles(issue);
      checkPullRequestForFile(context, issue, files);
    } catch (error) {
      app.log('Bad things:', error);
    }
  });

  app.on('pull_request.reopened', async context => {
    app.log('Pull Request Re-opened!');
    const issue = context.issue();
    try {
      const files = await context.github.pullRequests.listFiles(issue);
      checkPullRequestForFile(context, issue, files);
    } catch (error) {
      app.log('Bad things:', error);
    }
  });
};
