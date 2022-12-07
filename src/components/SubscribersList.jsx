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
  database,
  subscribers,
  refreshSubscriptions,
} ) =>
  (
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
            key={ email }
            email={ email }
            data={ data }
            database={ database }
            refreshSubscriptions={ refreshSubscriptions }
          />
        );

      } ) }
    </List>
  );

const SubscriberItem     = ( {
  email,
  data,
  database,
  refreshSubscriptions,
} ) =>
  (
    <ListItem
      key={ email }
    >
      <ListItemText primary={ email }>
      </ListItemText>
      <p>
        Активные подписки:
      </p>
      <List>
      { data.subs
          ? Object.entries( data.subs )
            .map( ( [
              key,
              value,
            ] ) =>
              (
                <SubscriptionItem
                  key={ key }
                  type={ key }
                  value={ value }
                  email={ email }
                  database={ database }
                  refreshSubscriptions={ refreshSubscriptions }
                />
              ) )
          : "Не найдены" }
    </List>
      <RequestsList
        database             = { database }
        email                = { email }
        refreshSubscriptions = { refreshSubscriptions }
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
      <ListItemText primary={ `${ type }: ${ methods.timestampToLocale( value ) }` }>
      </ListItemText>
      <ListItemButton onClick={ async() => {

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
