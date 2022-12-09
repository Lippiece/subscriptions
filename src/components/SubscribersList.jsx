/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-nil */
import "../css/SubscribersList.css";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import React from "react";

import methods from "../methods";
import RequestsList from "./RequestsList";

const SubscribersList = ( {
  requests,
  setRequests,
  globalRequests,
  database,
  subscribers,
  refreshRequests,
  refreshSubscriptions,
} ) =>
  (
    <div
      className={"subscribers-block"}>
      <h1>
        Подписчики:
      </h1>
      <List
        id="subscriptions"
      >
        { subscribers.map( subscriber => {

          const [
            email,
            data,
          ] = subscriber;
          return (
            <SubscriberItem
              data                 = { data }
              database             = { database }
              email                = { email }
              globalRequests       = { globalRequests }
              key                  = { email }
              refreshRequests      = { refreshRequests }
              refreshSubscriptions = { refreshSubscriptions }
              requests             = { requests }
              setRequests          = { setRequests }
            />
          );

        } ) }
      </List>
    </div>
  );

const SubscriberItem     = ( {
  email,
  data,
  database,
  refreshSubscriptions,
  refreshRequests,
  requests,
  setRequests,
  globalRequests,
} ) =>
  (
    <ListItem
      key={ email }
    >
      <ListItemText
        primary={ email } />
      <h2>
        Активные подписки:
      </h2>
      <List>
        { data.subs
          ? Object.entries( data.subs )
            .map( ( [
              key,
              value,
            ] ) =>
              (
                <SubscriptionItem
                  database={ database }
                  email={ email }
                  key={ key }
                  refreshSubscriptions={ refreshSubscriptions }
                  type={ key }
                  value={ value }
                />
              ) )
          : "Не найдены" }
      </List>
      <RequestsList
        database             = { database }
        email                = { email }
        globalRequests       = { globalRequests }
        refreshRequests      = { refreshRequests }
        refreshSubscriptions = { refreshSubscriptions }
        requests             = { requests }
        setRequests          = { setRequests }
      />
    </ListItem>
  );
const SubscriptionItem   = ( {
  type,
  value,
  email,
  database,
  refreshSubscriptions,
} ) =>
  (
    <ListItem>
      <ListItemText
        primary={ `${ type }: ${ methods.timestampToLocale( value ) }` } />
      <ListItemButton
        onClick={ async() => {

          await cancelSubscription(
            database,
            email,
            type
          );
          refreshSubscriptions();

        } }>
        Отменить
      </ListItemButton>
    </ListItem>
  );
const cancelSubscription = async(
  database,
  email,
  key
) => {

  await setDoc(
    doc(
      database,
      "subscriptions",
      email
    ),
    { subs: { [ key ]: deleteField() } },
    { merge: true }
  );

};
export default SubscribersList;
