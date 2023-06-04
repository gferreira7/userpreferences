# User Preferences API

The User Preferences API is a RESTful API that allows users to save their account preferences such as language, profile details, and terms & conditions acceptance.

## Usage

To use the User Preferences API, you will need to send a POST request to the endpoint URL with a JSON payload and a user ID header. The JSON payload should conform to the schema defined in the Swagger documentation.

For example, to save a user's preferences with the ID "12345", you could send the following request:
```
POST https://us-central1-hostelworld-assignment.cloudfunctions.net/api/v1/user/preferences
Content-Type: application/json
user-id: 12345

{
"termsAndConditionsAccepted": true,
"languagePreference": "EN",
"showLanguagesPreferences": false,
"showProfilePreferences": true
}
```
## Swagger Documentation

The Swagger documentation for the User Preferences API is available in JSON format in the `swaggerDocs.json` file in this repository. The documentation includes detailed information about the API, including the endpoint URL, request and response payloads, error codes, and examples.

You can view the Swagger documentation [here](https://app.swaggerhub.com/apis/GUILHERMERSRFERREIRA/UserPreferences/1.0.0), or use the file to generate client code or API documentation.

## Running the App

To run the User Preferences API, you will need to deploy it to a cloud platform such as Google Cloud Functions. The API is written in Node.js and uses the Nest JS framework.

To deploy the API:

1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Deploy the API to your cloud platform of choice, following the platform-specific instructions.

## License

This repository is licensed under the MIT License. See LICENSE.txt for more information.# User Preferences API

The User Preferences API is a RESTful API that allows users to save their account preferences such as language, profile details, and terms & conditions acceptance.
