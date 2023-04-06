const { graphql } = require('@octokit/graphql');
const fs = require('fs');
const zlib = require('zlib');
const consumers = require('stream/consumers');
const util = require('util');
const pipe = util.promisify(stream.pipeline);

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

  const input = fs.createReadStream('data.json.gz').pipe(zlib.createGunzip());
  const data = JSON.parse(await consumers.text(input));

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

  await pipe([JSON.stringify(data)], zlib.createGzip(), fs.createWriteStream('data.json.gz'));
}

main();