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

  const data = [
    Date.now(),
    repository.openIssues.totalCount,
    repository.closedIssues.totalCount,
    repository.openBugs.totalCount,
    repository.closedBugs.totalCount,
    repository.openFeatureRequests.totalCount,
    repository.closedFeatureRequests.totalCount,
    repository.openPRs.totalCount,
    repository.closedPRs.totalCount,
    repository.mergedPRs.totalCount
  ];

  fs.appendFileSync('data.jsonl', '\n' + JSON.stringify(data));
}

main();