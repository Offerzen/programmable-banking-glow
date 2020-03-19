const transactionsURL = process.env.transaction_url;
const slackWebhook = process.env.slack_url;
​const slackChannel = process.env.slack_channel;
const pronoun = process.env.pronoun;
const slackUserId = process.env.slack_user_id;
// Log a transaction to the sheet
async function logTransaction(authorization) {
    // In the case of an unauthorized (over budget) transaction, log it as a Declined Transaction
    const payload = {
        row: [
            moment(authorization.dateTime).format('YYYY-MM-DD'),
            moment(authorization.dateTime).format('HH:mm'),
            helpers.format.decimal(authorization.centsAmount / 100, 100),
            authorization.currencyCode,
            authorization.merchant.category.name,
            authorization.merchant.name,
            authorization.merchant.category.code
        ]
    };
​
    // Log the transaction to the Budget Sheet using HTTP Post
    const response = await fetch(transactionsURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json()
}
​
async function notifyOnSlack({ authorization, category, budgetValue }) {
    const spendAmount = helpers.format.decimal(authorization.centsAmount / 100, 100)
    const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `<@${slackUserId}> spent ${Math.round(budgetValue * 100)}% of ${pronoun} ${category} budget`, channel: slackChannel }),
    });
​
}
​
const beforeTransaction = async (authorization) => {
    return true
};
​
const afterTransaction = async (authorization) => {
    const { error, category, budgetValue } = await logTransaction(authorization);
    await notifyOnSlack({ authorization, category, budgetValue })
};
