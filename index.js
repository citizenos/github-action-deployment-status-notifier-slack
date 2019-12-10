'use strict';

const core = require('@actions/core');
const { context } = require('@actions/github');
const superagent = require('superagent');

core.debug(`GitHub Deployment Status Notifier Slack - Context ${context}`);

const envOwner = context.repo.owner;
const envRepo = context.repo.repo;

const eventPayload = context.payload;
const confStates = core.getInput('states'); // Comma separated list of deployment states that trigger the Slack notifications. For ex: pending, success, failure, error
const confSlackIncomingWebhookUrl = core.getInput('slack-incoming-webhook-url');

if (!eventPayload) {
    throw new Error('INVALID CONFIGURATION: Invalid event type configuration, event payload must contain "pull_request" property. See: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#pull-request-event-pull_request');
}

core.info(`GitHub Deployment Status Notifier Slack - event context ${JSON.stringify(context, null, 2)}`);
core.info(`GitHub Deployment Status Notifier Slack - event payload ${JSON.stringify(eventPayload, null, 2)}`);

const sendSlackMessage = async (message) => {
    return await superagent
        .post(confSlackIncomingWebhookUrl)
        .send(message);
};

const runAction = async () => {
    await sendSlackMessage({
        "blocks": [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Deployment Status Notifier Slack*'
                }
            }
        ]
    });
};

runAction()
    .then(() => {
        core.info('OK!');
    })
    .catch(async (err) => {
        core.setFailed(err.message);
    });