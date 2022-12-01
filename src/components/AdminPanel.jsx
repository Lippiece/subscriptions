/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import React from "react";

import { getFirebaseConfig } from "../firebase-config";
import NewUserForm from "./NewUserForm";
import SubscribersList from "./SubscribersList";

const app      = initializeApp( getFirebaseConfig() );
const database = getFirestore( app );

const AdminPanel = () => <>
    <Infobox />
    <NewUserForm />
    <SubscribersList database={ database } />
  </>;
const Infobox    = () =>
  ( <div
    id="info-container"
  >
    <p
      id="info-text"
    >
      Admin
    </p>
  </div> );
export default AdminPanel;
