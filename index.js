'use strict';

/**
 * GitHub Action for sending deployment status Slack notifications
 * @type {exports|module.exports}
 *
 * @see https://developer.github.com/v3/activity/events/types/#deploymentstatusevent
 * @see https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
 * @see https://api.slack.com/messaging/webhooks
 * @see https://slack.com/intl/en-ee/help/articles/115005265063-Incoming-WebHooks-for-Slack
 * @see https://api.slack.com/tools/block-kit-builder
 * @see https://api.slack.com/reference/block-kit/blocks
 * @see https://api.slack.com/reference/block-kit/block-elements#button
 */

const core = require('@actions/core');
const { context } = require('@actions/github');
const superagent = require('superagent');

core.debug(`GitHub Deployment Status Notifier Slack - Context ${context}`);

const payload = context.payload;
const confSlackIncomingWebhookUrl = core.getInput('slack-incoming-webhook-url');

if (context.eventName !== 'deployment_status') {
    throw new Error('INVALID CONFIGURATION: Invalid event type configuration, event must be "deployment_status". See: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#deployment-status-event-deployment_status');
}

if (!confSlackIncomingWebhookUrl) {
    throw new Error('INVALID CONFIGURATION: Missing Slack Incoming webhook configuration. To obdain incoming webhook url see https://slack.com/intl/en-ee/help/articles/115005265063-Incoming-WebHooks-for-Slack. To set up GitHub secrets see https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets');
}

core.debug(`GitHub Deployment Status Notifier Slack - event context ${JSON.stringify(context, null, 2)}`);

const sendSlackMessage = async (message) => {
    return await superagent
        .post(confSlackIncomingWebhookUrl)
        .send(message);
};

const runAction = async () => {
    if (confSlackIncomingWebhookUrl) {
        var createdAtTimestamp = new Date(payload.deployment_status.created_at).getTime().toString().substr(0, 10); // Slack does not like full millisecond timestamp...
        var shaShort = payload.deployment.sha.substr(0, 8);
        var buttonViewBuildLogStyle = ['success','pending'].includes(payload.deployment_status.state) ? 'primary' : 'danger'; // status:  primary, danger // https://api.slack.com/reference/block-kit/block-elements#button

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
                        "text": `*Repository*: <${payload.repository.html_url}|${payload.repository.full_name}\n*Status:* ${payload.deployment_status.state.toUpperCase()}>`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "View build log",
                            "emoji": true
                        },
                        "style": `${buttonViewBuildLogStyle}`,
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
