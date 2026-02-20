# Error Logging and Debugging

## Overview
The application includes error logging mechanisms to help diagnose issues in production.

## Server-Side Logging (API Routes)

### Location
- **Netlify Function Logs**: Available in Netlify Dashboard → Site → Functions → View logs
- **Console Logs**: Server-side `console.error()` calls appear in Netlify build/deploy logs

### Error Format
When an error occurs in `/api/create-portrait`, it logs:
```
[error_id] Error in create-portrait API: {
  message: "Error message",
  stack: "Error stack trace",
  name: "Error type"
}
```

### Error ID
Each error gets a unique ID like `err_1234567890_abc123` that:
- Is included in the error response to the client
- Can be used to search logs for the specific error
- Helps correlate client-reported errors with server logs

## Client-Side Logging (Browser Console)

### Location
- **Browser DevTools Console**: Open DevTools (F12) → Console tab

### What Gets Logged
- Empty responses from server
- JSON parse errors
- API error responses (with error IDs)
- Network request failures

### Log Format
All client-side errors are prefixed with `[create-portrait]` for easy filtering:
```
[create-portrait] API error: { status: 500, error: "...", error_id: "..." }
```

## Viewing Errors

### In Development
1. **Server logs**: Check terminal where `npm run dev` is running
2. **Client logs**: Check browser DevTools Console

### In Production (Netlify)
1. **Server logs**: 
   - Go to Netlify Dashboard → Your Site → Functions
   - Click on the function (e.g., `create-portrait`)
   - View logs in real-time or search historical logs
2. **Client logs**: 
   - Ask users to open DevTools Console (F12)
   - Look for `[create-portrait]` prefixed errors
   - Copy the error message and error_id (if present)

## Error Response Format

### Success Response
```json
{
  "queued": true,
  "upload_url": "...",
  "pet_name": "...",
  "message": "...",
  "webhook_ok": true
}
```

### Error Response
```json
{
  "error": "Human-readable error message",
  "error_id": "err_1234567890_abc123",
  "details": "Technical details (development only)"
}
```

## Debugging Workflow

1. **User reports error**: Get the error message and error_id (if shown)
2. **Search Netlify logs**: Use the error_id to find the server-side log entry
3. **Check browser console**: If user can share, check client-side logs
4. **Review error details**: Look at stack trace and error message in logs
5. **Fix and deploy**: Address the root cause

## Common Error Scenarios

### Empty Response
- **Client log**: `[create-portrait] Empty response: { status: 500 }`
- **Cause**: API route crashed before returning JSON
- **Fix**: Check server logs for the error_id

### JSON Parse Error
- **Client log**: `[create-portrait] JSON parse error: ...`
- **Cause**: API returned HTML error page or invalid JSON
- **Fix**: Check server logs, ensure API always returns JSON

### API Error with error_id
- **Client log**: `[create-portrait] API error: { error_id: "..." }`
- **Cause**: Error caught and handled, but operation failed
- **Fix**: Search Netlify logs using the error_id

## Adding More Logging

To add logging to other API routes:
1. Wrap the route handler in try-catch
2. Log errors with `console.error()` and include context
3. Return error_id in the response
4. Add client-side logging for API calls

## Future Enhancements

Consider adding:
- **Error tracking service**: Sentry, LogRocket, or similar
- **Structured logging**: Use a logging library for better formatting
- **Error reporting UI**: Allow users to report errors with context
- **Monitoring alerts**: Set up alerts for frequent errors
