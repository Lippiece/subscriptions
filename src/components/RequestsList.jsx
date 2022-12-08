/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-nil */
import "../css/RequestsList.css";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import React from "react";

import methods from "../methods";

const RequestsList = ( {
  email,
  database,
  refreshRequests,
  refreshSubscriptions,
  globalRequests,
} ) => {

  const [
    requests,
    setRequests,
  ] = React.useState( /** @type {Record<string, string>} */ {} );
  const refreshRequestsLocal = React.useCallback(
    async() => {

      const documentReference = doc(
        database,
        "requests",
        email
      );
      const documentSnap      = await getDoc( documentReference );
      setRequests( documentSnap.data() || {} );

    },
    [
      email,
      globalRequests,
    ]
  );
  React.useEffect(
    () => {

      refreshRequestsLocal();

    },
    [ refreshRequestsLocal ]
  );

  return (
    <div
      className="requests"
      hidden={Object.keys( requests ).length === 0}
    >
      {
        Boolean( requests )
        && (
          <>
            <p
              hidden={Object.keys( requests ).length === 0}>
              Запросы:
            </p>
            <List>
              {Object.entries( requests )
                .map( ( [
                  key,
                  value,
                ] ) =>
                  (
                    <RequestElement
                      database             = { database }
                      email                = { email }
                      expiry               = { value }
                      key                  = { key }
                      refreshRequests      = { refreshRequests }
                      refreshSubscriptions = { refreshSubscriptions }
                      type                 = { key }
                    />
                  ) )}
            </List>
          </> )
      }
    </div>
  );

};
const RequestElement = ( {
  type,
  expiry,
  database,
  email,
  refreshSubscriptions,
  refreshRequests,
} ) => {

  const [
    anchorElement,
    setAnchorElement,
  ] = React.useState( null );
  const [
    requests,
    setRequests,
  ]    = React.useState( [] );

  const handleClick = event => {

    setAnchorElement( event.currentTarget );

  };

  const handleClose = () => {

    setAnchorElement( null );

  };

  const open = Boolean( anchorElement );
  const id   = open
    ? "popover"
    : undefined;

  const handleAccept =  async() => {

    await acceptRequest(
      type,
      expiry,
      database,
      email
    )
      .then( async() => {

        refreshRequests();
        refreshSubscriptions();

      } );

  };

  return (
    <ListItem
      className="request">
      <ListItemText>
        { `${ type }: ${ expiry } мес.` }
      </ListItemText>
      <ListItemButton
        aria-describedby={ id }
        onClick={ handleClick }
      >
        Изменить
      </ListItemButton>
      <Menu
        anchorEl={ anchorElement }
        id={id}
        onClose={ handleClose }
        open={ open }
      >
        <MenuItem
          onClick={ () => {

            handleClose();
            handleAccept();

          } }
        >
          Принять
        </MenuItem>
        <MenuItem
          onClick={ () => {

            handleClose();
            removeRequest(
              type,
              database,
              email
            )
              .then( () => {

                refreshRequests();

              } );

          } }
        >
          Отменить
        </MenuItem>
      </Menu>

    </ListItem> );

};

// Get subscription requests for a user and return them as an array
const getRequests = async(
  /** @type {string} */ email ) => {

  try {

    const document_ = await getDoc( doc(
      database,
      "requests",
      email
    ) );
    return document_.data();

  } catch ( error ) {

    console.error( error );

  }

};

const acceptRequest = async(
  /** @type {string} */ type,
  /** @type {string} */ expiry,
  /** @type {import("@firebase/firestore").Firestore} */ database,
  /** @type {string} */ email
) => {

  const object    = methods.createSubscriptionObject(
    type,
    expiry
  );
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

    await setDoc(
      reference,
      merged
    );
    return await removeRequest(
      type,
      database,
      email
    );

  } catch ( error ) {

    console.error( error );

  }

};
const removeRequest = async(
  /** @type {string} */ type,
  /** @type {import("@firebase/firestore").Firestore} */ database,
  /** @type {string} */ email
) => {

  const reference = doc(
    database,
    "requests",
    email
  );
  const document  = await getDoc( reference );
  const updated   = { [ type ]: deleteField() };
  try {

    return await setDoc(
      reference,
      updated,
      { merge: true }
    );

  } catch ( error ) {

    console.error( error );

  }

};
export default RequestsList;
