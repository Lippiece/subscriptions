/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
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

  return <>
    <NewUserForm
      auth                 = { auth }
      userEmail            = { userEmail }
      userPassword         = { userPassword }
      refreshSubscriptions = { refreshSubscriptions }
    />
    <SubscribersList
      database             = { database }
      subscribers          = { subscribers }
      refreshSubscriptions = { refreshSubscriptions }
    />
    {/* <SubscriptionsPanel/> */}
  </>;

};
const getSubscriptions = async database => {

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

export default AdminPanel;
