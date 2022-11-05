/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { css } from "@emotion/css";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";

import { getFirebaseConfig } from "./firebase-config";
import methods from "./methods";

const app        = initializeApp( getFirebaseConfig() );
const createUser = async( email, password, length, type ) => {

  const auth = getAuth();
  try {

    await createUserWithEmailAndPassword( auth, email, password );
    await createSubscription( email, length, type );

  } catch ( error ) {

    console.error( error );

  }

};
const incrementDate = ( input, months ) => {

  const output = new Date( input );
  output.setMonth( output.getMonth() + months );
  return output;

};
const createSubscription = async( email, length, type ) => {

  const database = getFirestore( app );

  try {

    await setDoc( doc( database, "subscriptions", email ), {
      expires: incrementDate( Date.now(), Number( length ) ),
      type,
    } );

    document.body.append( "User created!" );

  } catch ( error ) {

    console.error( error );

  }

};
const renderForm = () => {

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
  return newUserForm;

};
const getSubscriptions = async() => {

  const database = getFirestore( app );
  try {

    const snapshot = await getDocs( collection( database, "subscriptions" ) );
    return await snapshot.docs.map( document_ =>
      [ document_.id, document_.data() ] );

  } catch ( error ) {

    console.log( error );
    return error;

  }

};
const listStyle           = css`
  & {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 1rem;

      *:first-child {
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
    }
  }
  `;
const renderSubscriptions = async() => {

  const subscriptions = document.createElement( "ul" );
  subscriptions.id    = "subscriptions";
  subscriptions.classList.add( listStyle );
  const data = await getSubscriptions();
  data.map( subscription => {

    const item        = document.createElement( "li" );
    const itemContent = [
      subscription[ 0 ],
      `Тип ${ subscription[ 1 ].type }`,
      `Истекает: ${ methods.timestampToDate( subscription[ 1 ].expires ) }`,
    ]
      .map( item_ => {

        const paragraph       = document.createElement( "p" );
        paragraph.textContent = item_;
        item.append( paragraph );
        return paragraph;

      } );
    subscriptions.append( item );

  } );

  return subscriptions;

};
const renderAdminUI = async() => {

  const newUserForm   = renderForm();
  const subscriptions = await renderSubscriptions();
  document.body.replaceChildren( newUserForm, subscriptions );

};

export default renderAdminUI;
