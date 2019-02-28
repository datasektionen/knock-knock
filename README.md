# Knock-knock

The computer science chapters system for holding information about attendance at SM.

Frontend and more in TODO

## Available Scripts

Run `npm install` in both root and server/<br>
Run `npm start` in root to start frontend and in server/ to start backend.<br>

frontend on localhost:3000<br>
backend on localhost:4000<br>

## Endpoints

/api/knock-knock - a knock knock joke

**Public**<br>
GET /api/getSMinSession - get the current active SM that is in session<br>
GET /api/getAllMembersInsideSM - get all members of the above SM in session<br>
POST /api/GetAllMembersOfSM - get all members of a SM identified by the sm_id<br>
GET /api/getAllSM - get a list of all SM sessions<br>
POST /api/isCheckedIn - check if a user is checked in to the session using their kth_id<br>

**Need pls-token "admin" or login + pls "admin"**<br>
POST /api/createNewSM - create a new SM session if there already is none running - define a new SM by its sm_name<br>
GET /api/endCurrentSM - end the current SM in session<br>
POST /api/checkIn - checks in a member into the currect active SM session - check in a new member by their kth_id and at what punkt_in<br>
POST /api/checkOut - checks out a member that is in the currect active SM session - check out a member by their kth_id and at what punkt_ut<br>

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.