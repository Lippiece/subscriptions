import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { getFirebaseConfig } from "./firebase-config.js";

// create sign in form
const signInForm     = document.createElement( "form" );
signInForm.id        = "sign-in-form";
signInForm.innerHTML = `
  <label for="sign-in-email">Email</label>
  <input type="email" id="sign-in-email" />
  <label for="sign-in-password">Password</label>
  <input type="password" id="sign-in-password" />
  <button type="submit">Sign In</button>
`;
document.body.append( signInForm );

// auth on submit
signInForm.addEventListener( "submit", event => {

  event.preventDefault();

  const email    = signInForm[ "sign-in-email" ].value;
  const password = signInForm[ "sign-in-password" ].value;

  signIn( email, password );

} );

// sign in
async function signIn( email, password ) {

  // get app
  const app = initializeApp( getFirebaseConfig() );
  // get auth
  const auth = getAuth( app );

  // create user with email and password or sign in
  try {

    await createUserWithEmailAndPassword( auth, email, password );

  } catch ( error ) {

    console.error( error );

  }

}

const loginForm     = document.createElement( "form" );
loginForm.id        = "login-form";
loginForm.innerHTML = `
  <label for="login-email">Email</label>
  <input type="email" id="login-email" />
  <label for="login-password">Password</label>
  <input type="password" id="login-password" />
  <button type="submit">Login</button>
`;
document.body.append( loginForm );

loginForm.addEventListener( "submit", event => {

  event.preventDefault();

  const email    = loginForm[ "login-email" ].value;
  const password = loginForm[ "login-password" ].value;

  login( email, password );

} );

async function login( email, password ) {

  const app  = initializeApp( getFirebaseConfig() );
  const auth = getAuth( app );

  try {

    await signInWithEmailAndPassword( auth, email, password );
    await greetUser();

  } catch ( error ) {

    console.error( error );

  }

}

// show sample text for signed user
const greetUser = async() => {

  const app  = initializeApp( getFirebaseConfig() );
  const auth = getAuth( app );

  if ( auth.currentUser ) {

    const user          = auth.currentUser;
    const paragraph     = document.createElement( "p" );
    paragraph.innerHTML = `Hello ${ user.email }!`;
    document.body.append( paragraph );
    await checkUser();

  }

};

// query firestore if user email is in database
const checkUser = async() => {

  const database      = getFirestore( initializeApp( getFirebaseConfig() ) );
  const querySnapshot = await getDocs( collection( database, "subscriptions" ) );
  const subscriptions = querySnapshot.docs.map( document_ =>
    console.log( document_.data() ) );

};
// button to get data from firestore
const getDataButton     = document.createElement( "button" );
getDataButton.id        = "get-data-button";
getDataButton.innerHTML = "Get Data";
document.body.append( getDataButton );

getDataButton.addEventListener( "click", checkUser );
