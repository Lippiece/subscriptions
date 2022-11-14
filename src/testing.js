/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { initializeApp } from "firebase/app";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

import { getFirebaseConfig } from "./firebase-config";

const app                    = initializeApp( getFirebaseConfig() );
const database               = getFirestore( app );
const testSubscriptionObject = ( type, expiry ) =>  (
  { [ type ]: expiry  } );

const addObjectToDatabase = async ( email, object ) => {

  const reference = doc(
    database,
    "subscriptions",
    email,
  );
  const document  = await getDoc( reference );
  const merged    = {
    subs: {
      ... document.data().subs,
      ... object,
    },
  };
  try {

    await setDoc(
      reference,
      merged,
    );

  } catch ( error ) {

    console.error(  error );

  }

};
const getObjectFromDatabase = async ( collection, id ) => {

  const document = doc(
    database,
    collection,
    id,
  );

  try {

    const doc_ = await getDoc( document );
    return doc_;

  } catch ( error ) {

    return console.error( error );

  }

};

const testMultipleSubscriptionsHandling = async () => {

  const email  = "a@test.test";
  const today  = new Date();
  const expiry = new Date(
    today.getFullYear(),
    today.getMonth() + Math.floor( Math.random() * 10 ),
    today.getDate(),
  );
  const object = testSubscriptionObject(
    "A",
    expiry,
  );
  await addObjectToDatabase(
    email,
    object,
  );
  const doc_ = await getObjectFromDatabase(
    "subscriptions",
    email,
  );
  console.log(
    "doc_.data()",
    doc_.data(),
  );
  return doc_.data();

};
export const addTestButton = () => {

  const button       = document.createElement( "button" );
  button.textContent = "Add test object";
  button.addEventListener(
    "click",
    testMultipleSubscriptionsHandling,
  );

  return button;

};
