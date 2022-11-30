/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { css } from "@emotion/css";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import React from "react";

import { getFirebaseConfig } from "../firebase-config";
import methods from "../methods";
import NewUserForm from "./NewUserForm";
import SubscribersList from "./SubscribersList";

const app      = initializeApp( getFirebaseConfig() );
const database = getFirestore( app );

const AdminPanel          = () => {

  console.log( "AdminPanel" );
  return ( <>
    <NewUserForm />
    <SubscribersList database={ database } />
  </>
  );

};
const Infobox             = () =>
  (
    <div
      id="info-container"
    >
      <p
        id="info-text"
      >
        Admin
      </p>
    </div>
  );
const addObjectToDatabase = async(
  email, object
) => {

  const reference = doc(
    database,
    "subscriptions",
    email
  );
  const document  = await getDoc( reference );
  const merged    = { subs: {
    ...( document.exists()
      ? document.data().subs
      : {} ),
    ...object,
  } };
  try {

    return await setDoc(
      reference,
      merged
    );

  } catch ( error ) {

    console.error( error );
    return infoText.textContent = methods.displayError( error );

  }

};
export default AdminPanel;
