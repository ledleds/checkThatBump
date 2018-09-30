/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

function findFile(files, fileToFind) {
  let foundFile = files.data.filter(file => {
    return fileToFind === file.filename
  });
  return foundFile
}

function requestChanges(context, issue, reviewComment) {
  context.github.pullRequests.createReview({
    ...issue,
    body: reviewComment,
    event: 'REQUEST_CHANGES',
  });
}

module.exports = app => {
  app.log('Yay, the app was loaded!')
  
  app.on('pull_request.opened', async context => {
    const issue = context.issue();
    const files = await context.github.pullRequests.getFiles(issue);
  
    const fileToFind = 'package.json'
    const foundFile = findFile(files, fileToFind)

    if (foundFile.length === 0) {
      const reviewComment = "Hey, you haven't made a change to the package.json, I think you need to update the version."
      requestChanges(context, issue, reviewComment)
    } else {
      const regex = new RegExp('[+]+ {2}"version"');
      const versionChange = regex.test(foundFile[0].patch);

      if (!versionChange) {
        app.log('No version bump, requesting changes');
        const reviewComment = "😿 You've forgotten your version bump."
        requestChanges(context, issue, reviewComment)
      }
    }
  });
}
