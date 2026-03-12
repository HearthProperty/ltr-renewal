# Integrations SOP — Renewal Uplift Planner

## Close CRM

### Endpoint
`POST https://api.close.com/api/v1/lead/`

### Authentication
Basic auth: API key as username, empty password.
```
Authorization: Basic {base64(CLOSE_API_KEY + ":")}
```

### Payload
```json
{
  "name": "Renewal Lead: {ownerName} — {propertyAddress}",
  "status_id": "env:CLOSE_LEAD_STATUS_ID",
  "contacts": [{
    "name": "{ownerName}",
    "emails": [{ "type": "office", "email": "{email}" }],
    "phones": [{ "type": "mobile", "phone": "{phone}" }]
  }],
  "custom.{CF_PROPERTY_ADDRESS}": "{propertyAddress}",
  "custom.{CF_ASKING_RENT}": "{currentRent}",
  "custom.{CF_DAYS_ON_MARKET}": "{daysUntilLeaseEnd}",
  "custom.{CF_URGENCY_SCORE}": "{leadScore}/{maxScore} — {scoreClassification}",
  "custom.{CF_AUDIT_SUMMARY}": "{summaryString}",
  "custom.{CF_LEAD_SOURCE}": "Renewal Uplift Planner"
}
```

### Summary String Format
```
Current Rent: ${currentRent} | Lease End: {leaseEndDate} | Days Left: {daysLeft} | Management: {mgmtLabel} | Target: {targetOutcome} | Last Increase: {lastRentIncrease} | Issues: {issuesSummary} | Score: {leadScore}/{maxScore} — {classification} | Primary Problem: {primaryProblem}
```

### Error Handling
- Close is the critical path. If Close fails, the entire submission fails.
- Log the full error response for debugging.
- Return error to client.

## Discord

### Endpoint
`POST {DISCORD_WEBHOOK_URL}`

### Payload
```json
{
  "embeds": [{
    "title": "🔄 New Renewal Lead",
    "color": 3066993,
    "fields": [
      { "name": "Lead Magnet", "value": "Renewal Uplift Planner", "inline": true },
      { "name": "Owner", "value": "{ownerName}", "inline": true },
      { "name": "Property", "value": "{propertyAddress}", "inline": false },
      { "name": "Current Rent", "value": "${currentRent}/mo", "inline": true },
      { "name": "Lease End", "value": "{leaseEndDate}", "inline": true },
      { "name": "Days Left", "value": "{daysUntilLeaseEnd}", "inline": true },
      { "name": "Manager", "value": "{mgmtLabel}", "inline": true },
      { "name": "Target", "value": "{targetOutcome}", "inline": true },
      { "name": "Score", "value": "{emoji} {leadScore}/{maxScore} — {classification}", "inline": true },
      { "name": "Primary Problem", "value": "{primaryProblem}", "inline": true },
      { "name": "Result", "value": "[View Plan]({resultUrl})", "inline": false }
    ],
    "timestamp": "ISO 8601"
  }]
}
```

### Error Handling
- Discord is fire-and-forget. If Discord fails, log the error but do NOT block the submission.
- Return `true`/`false` to indicate success.

## PDF Generation (v1)
- Library: `puppeteer-core` + `@sparticuz/chromium-min`
- Endpoint: `GET /api/pdf?data={base64EncodedData}`
- Generates branded renewal plan PDF from result data
- Runs on Vercel serverless (may need `maxDuration` in vercel.json)
