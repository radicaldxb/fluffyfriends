# n8n Workflow Setup Guide

## HTTP POST Node Configuration (After Image Generation)

After your n8n workflow generates the image, configure the HTTP POST node to send it back to your app:

### Node Settings

**Method:** `POST`

**URL:** 
```
https://your-domain.com/api/receive-n8n-image
```
(For local testing: `http://localhost:3000/api/receive-n8n-image`)

**Authentication:** None (or add API key if you add auth later)

### Request Body Format

The API accepts JSON with one of these image formats:

#### Option 1: Base64 Image (Recommended)
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "pet_name": "Test Pet",
  "original_image_url": "https://example.com/original.jpg",
  "user_email": "user@example.com",
  "status": "completed"
}
```

#### Option 2: Image URL
```json
{
  "image_url": "https://your-storage.com/generated-image.jpg",
  "pet_name": "Test Pet",
  "original_image_url": "https://example.com/original.jpg"
}
```

#### Option 3: Binary Data URL
```json
{
  "image_data_url": "data:image/png;base64,iVBORw0KGgo...",
  "pet_name": "Test Pet"
}
```

### n8n Node Configuration Steps

1. **Add HTTP Request node** after your image generation step
2. **Set Method** to `POST`
3. **Set URL** to your API endpoint (see above)
4. **Set Body Content Type** to `JSON`
5. **Configure Body** using n8n expressions:

#### If you have base64 image in a previous node:
```javascript
{
  "image_base64": "{{ $json.image_base64 }}",
  "pet_name": "{{ $json.pet_name }}",
  "original_image_url": "{{ $json.test_image }}",
  "status": "completed"
}
```

#### If you have binary data:
- Use a **Code** node before HTTP Request to convert binary to base64:
```javascript
const imageBuffer = Buffer.from($input.item.json.data);
const base64 = imageBuffer.toString('base64');
const mimeType = 'image/jpeg'; // or detect from your data

return [{
  json: {
    image_base64: `data:${mimeType};base64,${base64}`,
    pet_name: $input.item.json.pet_name,
    original_image_url: $input.item.json.test_image
  }
}];
```

### Required Fields

- **At least one image field:** `image_base64`, `image_url`, `image_data_url`, or `image_binary`
- **Optional:** `pet_name`, `original_image_url`, `user_email`, `status`

### Response

The API returns:
```json
{
  "success": true,
  "image_url": "https://your-supabase-url/storage/v1/object/public/images/generated/n8n-1234567890-abc123.jpg",
  "path": "generated/n8n-1234567890-abc123.jpg",
  "message": "Image stored successfully"
}
```

### Testing

1. Run your n8n workflow
2. Check the HTTP POST node response
3. Visit `/test-n8n` page - it will poll for the generated image
4. Image should appear automatically when ready

### Troubleshooting

- **400 Error:** Check that image data is properly formatted
- **500 Error:** Check Supabase Storage bucket exists and is public
- **Image not appearing:** Check that `pet_name` matches what you submitted on test page
