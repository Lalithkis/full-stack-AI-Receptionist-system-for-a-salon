# Debugging 500 Internal Server Error (n8n)

Great news! The connection is **working**.
The `204 No Content` in your ngrok terminal (the OPTIONS request) proves that your website successfully reached n8n.
However, the `500 Internal Server Error` means n8n "crashed" while processing your message.

## Steps to Fix

1.  **Check n8n Executions:**
    *   Go to your **n8n dashboard**.
    *   Click on the **Executions** tab (left sidebar or top bar).
    *   You should see a **Failed** execution (red 'x'). Click on it.
    *   It will highlight the node that failed in **Red**.

2.  **Verify Credentials:**
    *   *If the 'Groq' node is red:* Check your API Key.
    *   *If the 'Calendar' node is red:* Check your Google account connection.
    *   *If the 'AI Agent' node is red:* Read the error message in the output panel.

3.  **Ensure Workflow is Active:**
    *   The toggle in the top right must be **Green (Active)**.

4.  **Test with Simple Text:**
    *   Try sending a simple "Hello" from the website.
