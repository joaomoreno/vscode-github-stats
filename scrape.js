const { graphql } = require('@octokit/graphql');
const fs = require('fs');

async function main() {
  const { repository } = await graphql(
    `{
      repository(owner: "microsoft", name:"vscode") {
        openIssues: issues(states:OPEN) {
          totalCount
        }
        closedIssues: issues(states:CLOSED) {
          totalCount
        }
        openBugs: issues(states:OPEN, labels:["bug"]) {
          totalCount
        }
        closedBugs: issues(states:CLOSED, labels:["bug"]) {
          totalCount
        }
        openFeatureRequests: issues(states:OPEN, labels:["feature-request"]) {
          totalCount
        }
        closedFeatureRequests: issues(states:CLOSED, labels:["feature-request"]) {
          totalCount
        }
        openPRs: pullRequests(states:OPEN) {
          totalCount
        }
        closedPRs: pullRequests(states:CLOSED) {
          totalCount
        }
        mergedPRs: pullRequests(states:MERGED) {
          totalCount
        }
        stargazers {
          totalCount
        }
      }
    }`,
    { headers: { authorization: `token ${process.env['GITHUB_TOKEN']}`, }, }
  );

  console.log(repository);

  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

  data.push({
    timestamp: Date.now(),
    openIssues: repository.openIssues.totalCount,
    closedIssues: repository.closedIssues.totalCount,
    openBugs: repository.openBugs.totalCount,
    closedBugs: repository.closedBugs.totalCount,
    openFeatureRequests: repository.openFeatureRequests.totalCount,
    closedFeatureRequests: repository.closedFeatureRequests.totalCount,
    openPRs: repository.openPRs.totalCount,
    closedPRs: repository.closedPRs.totalCount,
    mergedPRs: repository.mergedPRs.totalCount
  });

  fs.writeFileSync('data.json', JSON.stringify(data));
}

main();