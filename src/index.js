/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
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
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { getFirebaseConfig } from "./firebase-config.js";

const app = initializeApp( getFirebaseConfig() );
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

// document.body.append( signInForm );

// auth on submit
signInForm.addEventListener( "submit", event => {

  event.preventDefault();

  const email    = signInForm[ "sign-in-email" ].value;
  const password = signInForm[ "sign-in-password" ].value;

  signIn( email, password );

} );

const signIn = async( email, password ) => {

  const auth = getAuth( app );

  try {

    await createUserWithEmailAndPassword( auth, email, password );

  } catch ( error ) {

    console.error( error );

  }

};
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

const login = async( email, password ) => {

  const auth = getAuth( app );

  try {

    await signInWithEmailAndPassword( auth, email, password );
    await greetUser();
    if ( await checkIfSubbed() ) {

      const links = await getDownloadLinks();
      listLinks( links );

    }

  } catch ( error ) {

    console.error( error );

  }

};

// show sample text for signed user
const greetUser = async() => {

  const auth = getAuth( app );

  if ( auth.currentUser ) {

    const user            = auth.currentUser;
    const paragraph       = document.createElement( "p" );
    paragraph.textContent = `Hello ${ user.email }!`;
    document.body.append( paragraph );

  }

};

// query firestore if user email is in database
const checkIfSubbed = async() => {

  const auth          = getAuth( app );
  const database      = getFirestore( app );
  const querySnapshot = await getDocs( collection( database, "subscriptions" ) );

  return querySnapshot.docs.some( document_ =>
    Object.keys( document_.data() )[ 0 ] === auth.currentUser.email
      && Object.values( document_.data() )[ 0 ] ===  true );

};
// list files from firestore
const getFiles = async() => {

  // Create a reference with an initial file path and name
  const storage       = getStorage();
  const pathReference = ref( storage, "images/" );

  try {

    const listResult = await listAll( pathReference );
    return listResult.items;

  } catch ( error ) {

    console.error( error );

  }

};
// list download links for files
const getDownloadLinks = async() => {

  const files    = await getFiles();
  const promises = files.map( file =>
    getDownloadURL( ref( file ) )  );

  try {

    return await Promise.all( promises );

  } catch ( error ) {

    console.error( error );

  }

};
const listLinks = links => {

  const list = document.createElement( "ul" );
  list.id    = "links-list";
  links.map( link => {

    const listItem     = document.createElement( "li" );
    listItem.innerHTML = `<a href="${ link }">${ link }</a>`;
    list.append( listItem );

  } );
  document.body.append( list );

};
// new user form for admin to create new user
const newUserForm     = document.createElement( "form" );
newUserForm.id        = "new-user-form";
newUserForm.innerHTML = `
  <label for="new-user-email">Email</label>
  <input type="email" id="new-user-email" />
  <label for="new-user-password">Password</label>
  <input type="password" id="new-user-password" />
  <label for="new-user-sub-length">Subscription Length</label>
  <input type="number" id="new-user-sub-length" />
  <label for="new-user-sub-type">Subscription Type</label>
  <select id="new-user-sub-type">
    <option value="monthly">Monthly</option>
    <option value="yearly">Yearly</option>
  </select>
  <button type="submit">Create User</button>
`;
document.body.append( newUserForm );

newUserForm.addEventListener( "submit", event => {

  event.preventDefault();

  const email    = newUserForm[ "new-user-email" ].value;
  const password = newUserForm[ "new-user-password" ].value;
  const length   = newUserForm[ "new-user-sub-length" ].value;
  const type     = newUserForm[ "new-user-sub-type" ].value;

  createUser( email, password, length, type );

} );

const createUser = async( email, password, length, type ) => {

  const auth = getAuth( app );

  try {

    await createUserWithEmailAndPassword( auth, email, password );
    await createSubscription( email, length, type );

  } catch ( error ) {

    console.error( error );

  }

};
const createSubscription = async( email, length, type ) => {

  const database = getFirestore( app );

  try {

    await setDoc( doc( database, "subscriptions", email ), {
      [ email ]: true,
      length,
      type,
    } );

  } catch ( error ) {

    console.error( error );

  }

};
