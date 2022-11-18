/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { css } from "@emotion/css";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { getFirebaseConfig } from "./firebase-config";
import methods from "./methods";
import { addTestButton } from "./testing";

const renderInfobox = () => {

  const container = document.createElement( "div" );
  container.id    = "info-container";
  const paragraph = document.createElement( "p" );
  paragraph.id    = "info-text";
  container.append( paragraph );
  return container;

};
const info             = renderInfobox();
const infoText         = info.querySelector( "#info-text" );
const app              = initializeApp( getFirebaseConfig() );
const auth             = getAuth( app );
const database         = getFirestore( app );
const getSubscription  = async email => {

  try {

    return await getDoc( doc(
      database,
      "subscriptions",
      email
    ) );

  } catch ( error ) {

    console.error( error );
    return infoText.textContent = methods.displayError( error );

  }

};
const getSubscriptions = async() => {

  try {

    const snapshot = await getDocs( collection(
      database,
      "subscriptions"
    ) );
    return snapshot.docs.map( document_ =>
      [
        document_.id,
        document_.data(),
      ] );

  } catch ( error ) {

    console.error( error );
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

      .subscriptions-container {
        *:first-child {
          margin-bottom: 0.5em;
          font-weight  : bold;
        }
      }
    }

    div.request-container {
      position      : absolute;
      top           : 0;
      left          : 7em;
      display       : flex;
      flex-direction: column;
      align-items   : right;

      .request {
        display       : flex;
        gap           : 0.5em;
        flex-direction: row;

        p {
          width: max-content;
        }

        button {
          height: 3em;
        }
      }

      .buttons {
        position      : relative;
        display       : flex;
        flex-direction: row;
        gap           : 0.1em;
      }

      button {
        border          : 1px solid #ccc;
        padding         : 0.5em 1em;
        background-color: #222;
        cursor          : pointer;

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

    const item         = document.createElement( "li" );
    const [
      email,
      data_,
    ] = subscription;
    item.dataset.email = email;
    const itemContents = Object.entries( data_.subs )
      .reduce(
        ( accumulator, [
          key,
          value,
        ] ) => {

          const subscriptionText       = document.createElement( "p" );
          subscriptionText.textContent = `${ key }: ${ methods.timestampToDate( value ) }`;
          accumulator.append(
            subscriptionText
          );
          return accumulator;

        },
        document.createElement( "div" )
      );
    const emailText       = document.createElement( "p" );
    emailText.textContent = email;
    itemContents.prepend( emailText );
    itemContents.classList.add( "subscriptions-container" );
    item.append( itemContents );
    subscriptions.append( item );

  } );

  return subscriptions;

};

// Get subscription requests and return them as an array
const getSubscriptionRequests = async() => {

  try {

    const snapshot = await getDocs( collection(
      database,
      "requests"
    ) );
    return snapshot.docs.map( document_ =>
      ( {
        types: document_.data().subs,
        user : document_.id,
      } ) );

  } catch ( error ) {

    console.error( error );
    return infoText.textContent = methods.displayError( error );

  }

};
const renderRequests = async() => {

  const requests = await getSubscriptionRequests();
  return requests.map( request =>
    methods.renderRequest( request, clearRequest,addObjectToDatabase ) );

};
const addObjectToDatabase = async( email, object ) => {

  const reference = doc(
    database,
    "subscriptions",
    email
  );
  const document  = await getDoc( reference );
  const merged    = {
    subs: {
      ...document.exists()
        ? document.data().subs
        : {},
      ...object,
    },
  };
  try {

    await setDoc(
      reference,
      merged
    );

    infoText.textContent = "Подписка успешно добавлена";

  } catch ( error ) {

    console.error( error );
    infoText.textContent = methods.displayError( error );

  }

};
const renderAdminUI = async() => {

  const newUserForm   = methods.renderForm(
    auth,
    createUserWithEmailAndPassword,
    addObjectToDatabase
  );
  const subscriptions = await renderSubscriptions();
  document.body.replaceChildren(
    info,
    newUserForm,
    subscriptions
  );
  return renderRequests();

};
const clearRequest = async (email, key) => {

  try {

    // remove entry from subscriptions if no more types
    const subscription = await getSubscription( request.user );
    if ( Object.keys( subscription.data().subs ).length === 0 ) {

      await deleteDoc(
        doc(
          database,
          "subscriptions",
          email
        )
      );

      return infoText.textContent = "Подписка успешно удалена";

    }

    // remove entry containing type from requests
    await updateDoc(
      doc(
        database,
        "requests",
        email
      ),
      { subs: { [ key ]: deleteField() } }
    );

    return infoText.textContent = "Запрос успешно удален";

  } catch ( error ) {

    console.error( error );
    infoText.textContent = methods.displayError( error );

  }

};
export default renderAdminUI;
