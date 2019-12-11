'use strict';

const core = require('@actions/core');
const { context } = require('@actions/github');
const superagent = require('superagent');

core.debug(`GitHub Deployment Status Notifier Slack - Context ${context}`);

const payload = context.payload;
const confSlackIncomingWebhookUrl = core.getInput('slack-incoming-webhook-url');

if (context.eventName !== 'deployment_status') {
    throw new Error('INVALID CONFIGURATION: Invalid event type configuration, event must be "deployment_status". See: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#deployment-status-event-deployment_status');
}

core.debug(`GitHub Deployment Status Notifier Slack - event context ${JSON.stringify(context, null, 2)}`);

const sendSlackMessage = async (message) => {
    return await superagent
        .post(confSlackIncomingWebhookUrl)
        .send(message);
};

const runAction = async () => {
    if (confSlackIncomingWebhookUrl) {
        // https://api.slack.com/messaging/webhooks
        // https://api.slack.com/tools/block-kit-builder
        // https://api.slack.com/reference/block-kit/blocks
        // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets


        var createdAtTimestamp = new Date(payload.deployment_status.created_at).getTime();
        var shaShort = payload.deployment.shaa.substr(0, 8);

        await sendSlackMessage({
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Deployment of *<${payload.deployment.payload.web_url}>*`
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*Status:* ${payload.deployment_status.state}`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "View build log",
                            "emoji": true
                        },
                        "style": "primary",
                        "url": `${payload.deployment_status.target_url}`
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": `commit: <${payload.repository.html_url}/commit/${payload.deployment.sha}|${shaShort}>, actor: ${context.actor} | <!date^${createdAtTimestamp}^{date_long_pretty} {time_secs}|${payload.deployment_status.created_at}>`
                        }
                    ]
                }
            ]
        });
    }
};

runAction()
    .then(() => {
        core.info('OK!');
    })
    .catch(async (err) => {
        core.setFailed(err.message);
    });