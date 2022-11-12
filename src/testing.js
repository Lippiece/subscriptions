/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { initializeApp } from "firebase/app";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

import { getFirebaseConfig } from "./firebase-config";

const app                 = initializeApp( getFirebaseConfig() );
const database            = getFirestore( app );
const addObjectToDatabase = async ( email, object ) => {

  const document = doc(
    database,
    "subscriptions",
    email,
  );

  try {

    await setDoc(
      document,
      { subs: object },
    );

  } catch ( error ) {

    console.error( error );

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

    console.error( error );

  }

};
const testSubscriptionObject = ( type, expiry ) => ( { type: expiry  } );

export const addTestButton = () => {

  const button       = document.createElement( "button" );
  button.textContent = "Add test object";
  button.addEventListener(
    "click",
    async () => {

      const email  = "a@test.test";
      const object = testSubscriptionObject(
        "test",
        new Date(),
      );
      await addObjectToDatabase(
        email,
        object,
      );
      const doc_ = await getObjectFromDatabase(
        "subscriptions",
        email,
      );
      console.log( doc_.data() );

    },
  );

  return button;

};
