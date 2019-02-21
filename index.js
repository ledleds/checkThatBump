/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

const semver = require('semver');

function findFile(files, fileToFind) {
  return files.data.filter(file => fileToFind === file.filename);
}

function requestChanges(context, issue, reviewComment) {
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


function checkPullRequest(issue, files, context) {
  const fileToFind = 'package.json';
  const foundFile = findFile(files, fileToFind);

  if (foundFile.length === 0) {
    // no change to the package.json
    const reviewComment =
      "Hey, you haven't made a change to the package.json, I think you need to update the version. 🖖";
    requestChanges(context, issue, reviewComment);
  } else {
    const regex = new RegExp('[+]+ {2}"version"');
    const versionChange = regex.test(foundFile[0].patch);

    if (!versionChange) {
      const reviewComment = "😿 You've forgotten your version bump.";
      requestChanges(context, issue, reviewComment);
    }

    const isIncremented = checkVersionIsIncremented(foundFile[0].patch);
    if (!isIncremented) {
      const reviewComment = "Hey, you shouldn't decrement the version. 👀";
    requestChanges(context, issue, reviewComment);
    }
  }
}

module.exports = app => {
  console.log('Yay, the app was loaded!');

  app.on('pull_request.opened', async context => {
    app.log('Pull Request Opened!');
    const issue = context.issue();
    try {
      const files = await context.github.pullRequests.listFiles(issue);
      checkPullRequest(issue, files, context);
    } catch (error) {
      app.log('Bad things:', error);
    }
  });

  app.on('pull_request.reopened', async context => {
    app.log('Pull Request Re-opened!');
    const issue = context.issue();
    try {
      const files = await context.github.pullRequests.listFiles(issue);
      checkPullRequest(issue, files, context);
    } catch (error) {
      app.log('Bad things:', error);
    }
  });
};
