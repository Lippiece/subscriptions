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

const renderInfobox = () => {

  const container = document.createElement( "div" );
  container.id    = "info-container";
  const paragraph = document.createElement( "p" );
  paragraph.id    = "info-text";
  container.append( paragraph );
  return container;

};
const info     = renderInfobox();
const infoText = info.querySelector( "#info-text" );
const app      = initializeApp( getFirebaseConfig() );
// eslint-disable-next-line @getify/proper-arrows/params
const createUser = async( email, password, length, type ) => {

  const auth = getAuth();
  try {

    await createUserWithEmailAndPassword( auth, email, password );
    return await createSubscription( email, length, type );

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

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

    return document.body.append( "User created!" );

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

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

    return infoText.textContent = methods.displayError( error );

  }

};
const listStyle           = css`
  & {
    list-style: none;
    padding   : 0;

    li {
      position     : relative;
      border-bottom: 1px solid #111;

      * {
        margin-block-start: 0;
        margin-block-end  : 0;
      }

      *:first-child {
        margin-bottom: 0.5em;
        font-weight: bold;
      }
    }

    div {
      position       : absolute;
      top            : 0;
      right          : -5em;
      display        : flex;
      flex-direction : column;
      align-items    : right;

      button {
        border: 1px solid #ccc;
        padding: 0.5em 1em;
        background-color: #222;
        cursor: pointer;

        &:hover {
          background-color: #333;
        }

      }

      * {
        margin: 0;
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

    const item             = document.createElement( "li" );
    const [ email, data_ ] = subscription;
    item.dataset.email     = email;
    const itemContent      = [
      email,
      `Истекает: ${ methods.timestampToDate( data_.expires ) }`,
      `Тип: ${ data_.type }`,
    ];
    itemContent.map( item_ => {

      const paragraph       = document.createElement( "p" );
      paragraph.textContent = item_;
      item.append( paragraph );
      return paragraph;

    } );
    subscriptions.append( item );

  } );

  return subscriptions;

};

// Get subscription requests and return them as an array
const getSubscriptionRequests = async() => {

  const database = getFirestore( app );
  try {

    const snapshot = await getDocs( collection( database, "requests" ) );
    return await snapshot.docs.map( document_ =>
      ( {
        length: document_.data().length,
        type  : document_.data().type,
        user  : document_.id,
      } ) );

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};

const fillForm = request =>
  event => {

    event.preventDefault();
    const form                          = document.querySelector( "#new-user-form" );
    form[ "new-user-email" ].value      = request.user;
    form[ "new-user-sub-length" ].value = request.length;
    form[ "new-user-sub-type" ].value   = request.type;
    form[ "new-user-password" ].value   = "password";

  };

/**
* Render incoming requests
* positioned to the right of the corresponding users
* with button to accept which creates a subscription
*/
const renderRequest = request => {

  const requestContainer = document.createElement( "div" );
  requestContainer.classList.add( "request-container" );
  const acceptButton = document.createElement( "button" );
  requestContainer.append( acceptButton );
  acceptButton.textContent = "Принять";
  const requestContent     = [
    `Срок: ${ request.length }`,
    `Тип: ${ request.type }`,
  ];
  requestContent.map( item => {

    const paragraph       = document.createElement( "p" );
    paragraph.textContent = item;
    requestContainer.append( paragraph );
    return paragraph;

  } );
  acceptButton.addEventListener( "click", event =>
    fillForm( request )( event ) );
  document.querySelector( `li[data-email="${ request.user }"]` )
    .append( requestContainer );

};
const renderRequests = async() => {

  const requests = await getSubscriptionRequests();
  return requests.map( request =>
    renderRequest( request ) );

};
const renderAdminUI = async() => {

  const newUserForm   = renderForm();
  const subscriptions = await renderSubscriptions();
  document.body.replaceChildren( info, newUserForm, subscriptions );
  const requests = await renderRequests();

};
export default renderAdminUI;
