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
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
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
      email,
    ) );

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};
const getSubscriptions = async () => {

  try {

    const snapshot = await getDocs( collection(
      database,
      "subscriptions",
    ) );
    return snapshot.docs.map( document_ => [
      document_.id,
      document_.data(),
    ] );

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

      div {
        *:first-child {
          margin-bottom: 0.5em;
          font-weight  : bold;
        }
      }
    }

    div.request-container {
      position       : absolute;
      top            : 0;
      right          : -5em;
      display        : flex;
      flex-direction : column;
      align-items    : right;

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
const renderSubscriptions = async () => {

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
    const itemContents = Object.entries( data_.subs ).reduce(
      ( acc, [
        key,
        value,
      ] ) => {

        const subscriptionText       = document.createElement( "p" );
        subscriptionText.textContent = `${ key }: ${ methods.timestampToDate( value ) }`;
        acc.append(
          subscriptionText,
        );
        return acc;

      },
      document.createElement( "div" ),
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
const getSubscriptionRequests = async () => {

  try {

    const snapshot = await getDocs( collection(
      database,
      "requests",
    ) );
    return snapshot.docs.map( document_ => ( {
      length: document_.data().length,
      type  : document_.data().type,
      user  : document_.id,
    } ) );

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};
const renderRequests = async () => {

  const { renderRequest } = methods;
  const requests          = await getSubscriptionRequests();
  return requests.map( request => renderRequest( request ) );

};
const addObjectToDatabase = async ( email, object ) => {

  const reference = doc(
    database,
    "subscriptions",
    email,
  );
  const document  = await getDoc( reference );
  const merged    = {
    subs: {
      ... document.exists()
        ? document.data().subs
        : {},
      ... object,
    },
  };
  try {

    await setDoc(
      reference,
      merged,
    );

    infoText.textContent = "Подписка успешно добавлена";

  } catch ( error ) {

    infoText.textContent = methods.displayError( error );

  }

};
const renderAdminUI = async () => {

  const newUserForm   = methods.renderForm(
    auth,
    createUserWithEmailAndPassword,
    addObjectToDatabase,
  );
  const subscriptions = await renderSubscriptions();
  document.body.replaceChildren(
    info,
    newUserForm,
    subscriptions,
  );
  return renderRequests();

};

export default renderAdminUI;
