/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

function findFile(files, fileToFind) {
  files.data.filter(file => fileToFind === file.filename);
}

function requestChanges(context, issue, reviewComment) {
  context.github.pullRequests.createReview({
    ...issue,
    body: reviewComment,
    event: 'REQUEST_CHANGES',
  });
}

function checkPullRequest(issue, files, context) {
  console.log('In checkPullRequest');
  const fileToFind = 'package.json';
  const foundFile = findFile(files, fileToFind);
  console.log('Found file length: ', foundFile.length);

  if (foundFile.length === 0) {
    app.log('No change to package.json, requesting changes');
    const reviewComment =
      "Hey, you haven't made a change to the package.json, I think you need to update the version.";
    requestChanges(context, issue, reviewComment);
  } else {
    const regex = new RegExp('[+]+ {2}"version"');
    const versionChange = regex.test(foundFile[0].patch);

    if (!versionChange) {
      app.log('No version bump, requesting changes');
      const reviewComment = "😿 You've forgotten your version bump.";
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
      const files = await context.github.pullRequests.getFiles(issue);
      checkPullRequest(issue, files, context);
    } catch (error) {
      app.log('Bad things:', error)
    }
  });

  app.on('pull_request.reopened', async context => {
    app.log('Pull Request Re-opened!');
    const issue = context.issue();
    try {
      const files = await context.github.pullRequests.getFiles(issue);
      checkPullRequest(issue, files, context);
    } catch (error) {
      app.log('Bad things:', error)
    }
  });
};
