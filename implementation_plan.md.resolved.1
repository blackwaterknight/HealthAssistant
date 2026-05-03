# Replace Mock AI with Azure Agent API Call

This plan outlines the steps to replace the current JavaScript-based AI simulation with a real `fetch` call to an external Azure Agent endpoint. 

## User Review Required

> [!IMPORTANT]
> To ensure the API integration works seamlessly, please review the open questions below and provide the necessary details before I begin execution.

## Open Questions

> [!WARNING]
> 1. **Endpoint URL**: What is the full URL of the Azure Agent endpoint?
> 2. **Authentication**: Does the endpoint require authentication (e.g., Bearer token, API Key)? If so, how should it be passed?
> 3. **Request Schema**: How should the user query be formatted in the request body? (e.g., `{ "query": "..." }`, `{ "messages": [...] }`)
> 4. **Response Schema**: Does the Azure Agent return the structured intent payload we established earlier (`{ intent, response, data }`), or will I need to map a different response structure?

## Proposed Changes

### `script.js`

#### [MODIFY] script.js
- **Remove**: `simulateExternalAICall` which currently generates mock JSON responses based on keywords.
- **Add**: An async function `callAzureAgentAPI(message)` that:
  - Uses the native `fetch` API to send a POST request to the Azure endpoint.
  - Passes the `message` inside the expected request payload.
  - Handles HTTP errors (e.g., non-200 status codes) and network errors using `try/catch`.
- **Update**: `simulateAIResponse(userMessage)` to call `callAzureAgentAPI`.
  - Maintain the existing loading state ("AI is typing..." indicator and "Processing..." toast).
  - Await the API response.
  - Extract the text and intent from the API response and render it in the chat.
  - Gracefully handle UI state if the API times out or fails (e.g., showing a user-friendly error message bubble).

## Verification Plan

### Manual Verification
- Once implemented, I will ask you to test the chat interface. You can type a message, verify that a network request is made to your endpoint, and confirm that the chat bubble and UI update correctly based on the Azure Agent's live response.
