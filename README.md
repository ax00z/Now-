# NowDownloader

NowDownloader is a Chromium extension that helps you easily find and download all video files embedded within a web page. With just a click, this extension scans the current page and provides a list of downloadable video links.

## Features

- Scans a web page and fetches all video files
- Provides a convenient browser action button with a popup interface
- Displays a list of downloadable video links in the popup
- Utilizes content scripts to extract video information from web pages
- Supports all Chromium-based browsers (such as Google Chrome, Microsoft Edge, and Brave)

## Getting Started

1. Clone the repository and navigate to the project directory.
2. Load the extension into your Chromium-based browser:
   - Open the Extensions page by navigating to `chrome://extensions` (or the equivalent in your browser).
   - Enable Developer mode by toggling the switch in the top right corner.
   - Click the "Load unpacked" button and select the project directory.
3. The extension should now be active in your browser. You can access its popup interface by clicking the browser action button.
4. Visit a web page containing videos, and click the NowDownloader button to view and download the available video files.

## Customization

Modify the content scripts, background scripts, and other resources in the project directory to implement additional features or improve the extension's functionality. Update the manifest file as necessary to reflect the changes and permissions required for your extension.
