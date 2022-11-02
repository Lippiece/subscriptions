/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import { css } from "@emotion/css";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { getFirebaseConfig } from "./firebase-config.js";

document.body.classList.add( css`
  & {
    font-family    : 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size      : 1.5em;
    gap            : 1.5em;
    display        : flex;
    flex-direction : column;
    align-items    : center;
    justify-content: center;
    height         : 100vh;

    form {
      display        : flex;
      gap            : 0.5em;
      flex-direction : column;
      align-items    : center;
      justify-content: center;

      input#new-user-sub-length {
        width: 3em;
      }

    }

    * {
      color: rgba(0, 0, 0, 0.8);
    }
  }` );
const app           = initializeApp( getFirebaseConfig() );
const loginForm     = document.createElement( "form" );
loginForm.id        = "login-form";
loginForm.innerHTML = `
  <label for="login-email">Email</label>
  <input type="email" id="login-email" autocomplete="login-email" />
  <label for="login-password">Пароль</label>
  <input type="password" id="login-password" autocomplete="current-password" />
  <button type="submit">Войти</button>
`;
document.body.append( loginForm );

loginForm.addEventListener( "submit", event => {

  event.preventDefault();

  const email    = loginForm[ "login-email" ].value;
  const password = loginForm[ "login-password" ].value;

  login( email, password );

} );
const login = async( email, password ) => {

  const auth = getAuth();

  try {

    await signInWithEmailAndPassword( auth, email, password );
    await displayUserData();

  } catch ( error ) {

    console.error( error );

  }

};
const getUserType = async email => {

  const database            = getFirestore( app );
  const adminReference      = doc( database, "admins", email );
  const subscriberReference = doc( database, "subscriptions", email );
  const adminData           = await getDoc( adminReference );
  const subscriberData      = await getDoc( subscriberReference );
  const types               = {
    admin: adminData.data(),
    sub  : subscriberData.data(),
  };

  return Object.keys( types )
    .find( key =>
      types[ key ] );

};
const renderAdminUI = () => {

  const newUserForm     = document.createElement( "form" );
  newUserForm.id        = "new-user-form";
  newUserForm.innerHTML = `
  <label for="new-user-email">Email</label>
  <input type="email" id="new-user-email" />
  <label for="new-user-password">Пароль</label>
  <input type="password" id="new-user-password" />
  <label for="new-user-sub-length">Длительность подписки (мес.)</label>
  <input type="number" id="new-user-sub-length" />
  <label for="new-user-sub-type">Тип подписки</label>
  <select id="new-user-sub-type">
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
  </select>
  <button type="submit">Зарегистрировать</button>
`;

  newUserForm.addEventListener( "submit", event => {

    event.preventDefault();

    const email    = newUserForm[ "new-user-email" ].value;
    const password = newUserForm[ "new-user-password" ].value;
    const length   = newUserForm[ "new-user-sub-length" ].value;
    const type     = newUserForm[ "new-user-sub-type" ].value;

    createUser( email, password, length, type );

  } );
  document.body.replaceChildren( newUserForm );

};
const subscriptionNotExpired = async() => {

  const auth = getAuth();

  // get "expires" value from user email document
  const firestore             = getFirestore();
  const userReference         = doc( firestore, "subscriptions", auth.currentUser.email );
  const userData              = await getDoc( userReference );
  const subscriptionDate      = userData.data().expires.seconds;
  const subscriptionTimestamp = new Date( subscriptionDate * 1000 )
    .getTime();

  // check if subscription date is in the past
  return subscriptionTimestamp > Date.now();

};
const displayUserData = async() => {

  const auth           = getAuth();
  const greeting       = document.createElement( "p" );
  greeting.id          = "greeting";
  greeting.textContent = `Здравствуйте, ${ auth.currentUser.email }!`;
  document.body.append( greeting );

  const userType     = await getUserType( auth.currentUser.email );
  const typesActions = {
    admin: renderAdminUI,
    sub  : async() => {

      if ( await subscriptionNotExpired() ) {

        console.log( "subscription not expired" );
        const links = await getDownloadLinks();
        return listLinks( links );

      }
      console.log( "subscription expired" );
      const expiryParagraph       = document.createElement( "p" );
      expiryParagraph.id          = "subscription-expired";
      expiryParagraph.textContent = "Ваша подписка истекла.";
      return document.body.append( expiryParagraph );

    },
  };
  typesActions[ userType ]();

};

// list files from firestore
const getFiles = async() => {

  const auth = getAuth();
  // get "type" value from user email document
  const firestore        = getFirestore();
  const userReference    = doc( firestore, "subscriptions", auth.currentUser.email );
  const userData         = await getDoc( userReference );
  const subscriptionType = userData.data().type;

  // get files from storage
  const storage       = getStorage();
  const pathReference = ref( storage, subscriptionType );

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
const createUser = async( email, password, length, type ) => {

  const auth = getAuth();
  try {

    await createUserWithEmailAndPassword( auth, email, password );
    await createSubscription( email, length, type );

  } catch ( error ) {

    console.error( error );

  }

};
const addToDate = ( input, months ) => {

  const output = new Date( input );
  output.setMonth( output.getMonth() + months );
  return output;

};
const createSubscription = async( email, length, type ) => {

  const database = getFirestore( app );

  try {

    await setDoc( doc( database, "subscriptions", email ), {
      expires: addToDate( Date.now(), Number( length ) ),
      type,
    } );

    document.body.append( "User created!" );

  } catch ( error ) {

    console.error( error );

  }

};
