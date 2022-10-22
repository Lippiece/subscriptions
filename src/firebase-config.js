/**
 * To find your Firebase config object:
 *
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  // eslint-disable-next-line no-secrets/no-secrets
  apiKey           : "AIzaSyCcD8LPTFZIuf76MMZRBu5WnnmuOAZsNxY",
  appId            : "1:675628861639:web:3c62af5fb211d2bbd2d6e2",
  authDomain       : "subscriptions-ce6b3.firebaseapp.com",
  databaseURL      : "https://subscriptions-ce6b3-default-rtdb.firebaseio.com",
  messagingSenderId: "675628861639",
  projectId        : "subscriptions-ce6b3",
  storageBucket    : "subscriptions-ce6b3.appspot.com",
};

export function getFirebaseConfig() {

  if ( !config || !config.apiKey ) {

    throw new Error( "No Firebase configuration object provided." + "\n"
    + "Add your web app's configuration object to firebase-config.js" );

  } else {

    return config;

  }

}
