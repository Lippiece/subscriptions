/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import "../css/AdminPanel.css";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import React from "react";

import { getFirebaseConfig } from "../firebase-config";
import NewUserForm from "./NewUserForm";
import SubscriptionsPanel from "./SubscirptionsPanel";
import SubscribersList from "./SubscribersList";

const app      = initializeApp( getFirebaseConfig() );
const auth     = getAuth( app );
const database = getFirestore( app );

const AdminPanel = ( {
  userEmail,
  userPassword,
} ) => {

  const [
    subscribers,
    setSubscribers,
  ] = React.useState( [] );
  const [
    requests,
    setRequests,
  ] = React.useState( {} );
  const refreshSubscriptions = React.useCallback(
    async() => {

      await getSubscriptions( database )
        .then( setSubscribers );

    },
    []
  );
  React.useEffect(
    () => {

      const data = refreshSubscriptions();

    },
    [ refreshSubscriptions ]
  );
  const refreshRequests = React.useCallback(
    async() => {

      await getRequests()
        .then( data =>
          ( data
            ? setRequests( data )
            : setRequests( {} ) ) );

    },
    [ subscribers ]
  );
  React.useEffect(
    () => {

      const data = refreshRequests();

    },
    [ refreshRequests ]
  );

  return (
    <>
      <NewUserForm
        auth                 = { auth }
        refreshSubscriptions = { refreshSubscriptions }
        userEmail            = { userEmail }
        userPassword         = { userPassword }
      />
      <SubscribersList
        database             = { database }
        globalRequests       = { requests }
        refreshRequests      = { refreshRequests }
        refreshSubscriptions = { refreshSubscriptions }
        requests             = { requests }
        setRequests          = { setRequests }
        subscribers          = { subscribers }
      />
      <SubscriptionsPanel
        refreshGlobalSubscriptions={ refreshSubscriptions }
        refreshRequests={ refreshRequests }
      />
    </> );

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

  }

};

// get requests for all users
const getRequests = async() => {

  try {

    const snapshot = await getDocs( collection(
      database,
      "requests"
    ) );
    return snapshot.docs.map( document_ =>
      [
        document_.id,
        document_.data(),
      ] );

  } catch ( error ) {

    console.error( error );

  }

};
export default AdminPanel;
