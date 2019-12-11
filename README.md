# GitHub Action Deployment Status Notifier for Slack

GitHub Action to send deployment status notification messages to Slack.

## Configuration

* Generate an Incoming Webhook URL for Slack - https://slack.com/intl/en-ee/help/articles/115005265063-Incoming-WebHooks-for-Slack
* Add generated Incoming Webhook URL to GitHub repository secrets as `SLACK_INCOMING_WEBHOOK_URL` in the repository settings - https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
* Create `.github/workflows/deployment_status_notifications_to_slack.yaml` file with following contents:
```
name: Deployment notifications to Slack

on:
  deployment_status
jobs:
  deployment_status_notifications_to_slack:
    runs-on: ubuntu-latest
    steps:
    - name: Deployment Status Notifications to Slack
      uses: citizenos/github-action-deployment-status-notifier-slack@25a6784
      with:
        slack-incoming-webhook-url: ${{secrets.SLACK_INCOMING_WEBHOOK_URL}}
```
* Push changes and deploy to verify configuration.

**NOTE:** 

* `uses: citizenos/github-action-deployment-status-notifier-slack@25a6784`
   * `@25a678` is a version reference.

### More info

* https://github.com/features/actions
* https://api.slack.com/messaging/webhooks
* https://help.github.com/en/actions/automating-your-workflow-with-github-actions
* https://slack.com/intl/en-ee/help/articles/115005265063-Incoming-WebHooks-for-Slack
* https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
