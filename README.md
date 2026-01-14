# User Website - Sadeesh's Blog

This is the user-facing website folder. It can be hosted separately from the backend and admin panel.

## Structure

```
website/
├── index.html          # Homepage
├── blog.html           # Blog post detail page
├── config.js           # API configuration
├── README.md           # This file
├── css/
│   └── style.css       # All styles
└── js/
    └── main.js         # Main JavaScript
```

## Configuration

### API URL Configuration

Edit `config.js` and set your backend API URL:
```javascript
window.API_BASE_URL = 'https://your-api-domain.com';
```

## Hosting

This website can be hosted on any static file hosting service:

- **Netlify**: Drag and drop the `website` folder
- **Vercel**: Connect your repository or deploy the folder
- **GitHub Pages**: Push to a repository and enable Pages
- **AWS S3 + CloudFront**: Upload files to S3 bucket
- **Any web server**: Upload files to your server's public directory

## Setup for Production

1. **Update API URL**: Edit `config.js` with your production backend URL
2. **CORS**: Ensure your backend allows requests from your website domain
3. **Upload**: Deploy all files in this folder to your hosting service

## Development

For local development:

1. Make sure backend is running on `http://localhost:8000`
2. Open `index.html` in a browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js (http-server)
   npx http-server -p 8080
   ```
3. Access at `http://localhost:8080`

## Notes

- All paths are relative, so the folder structure must be maintained
- The website makes API calls to the backend - ensure CORS is configured
- Uploaded images/videos are served from the backend at `/uploads/`
