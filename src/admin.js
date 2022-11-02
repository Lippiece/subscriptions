/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

import { getFirebaseConfig } from "./firebase-config.js";

const app = initializeApp( getFirebaseConfig() );
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

export default renderAdminUI;
