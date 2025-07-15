Url Shortner
Frontend
•	Framework: React (with Material UI for UI components)
•	Main Components:
•	App.js: The root component, responsible for rendering the main URL shortener interface.
•	UrlShortener.js: Contains all the logic and UI for the URL shortening form, validation, and result display.
•	Styling: Uses Material UI’s system and some default CSS for layout and appearance.

Backend

•	Assumed API: The frontend expects a backend API endpoint (e.g., POST /api/shorten) to handle URL shortening requests.
•	Note: In this current setup, the backend is not implemented in this repo, but the frontend is designed to interact with such an API.
Logging Middleware
•	Custom Logger: All logging (info, error, etc.) is routed through a custom logger (logger.js), which sends logs to a remote evaluation service instead of using console.log.

3. Key Functional Flows
A. URL Shortening Flow
1.	User Input: User can enter up to 5 URLs, with optional validity and custom shortcode.
2.	Validation: Client-side validation checks URL format, validity (integer), and shortcode rules.
3.	Submission: On submit, the component:
•	Calls the backend API for each valid entry.
•	Handles and displays errors per entry.
•	Shows the resulting short URLs and their expiry.
4.	Logging: All major actions (mount, add/remove, submit, API call, error) are logged using the custom logger.



 
