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
  refreshSubscriptions,
} ) => {

  const [
    requests,
    setRequests,
  ] = React.useState( {} );
  const getData = React.useCallback(
    async() => {

      await getRequests(
        database,
        email
      )
        .then( data =>
          ( data
            ? setRequests( data )
            : setRequests( {} ) ) );

    },
    [
      database,
      email,
    ]
  );
  React.useEffect(
    () => {

      const data = getData();

    },
    [ getData ]
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
            <p hidden={Object.keys( requests ).length === 0}>
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
                      key                  = { key }
                      type                 = { key }
                      expiry               = { value }
                      database             = { database }
                      email                = { email }
                      requests             = { requests }
                      setRequests          = { setRequests }
                      refreshSubscriptions = { refreshSubscriptions }
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
  requests,
  setRequests,
  refreshSubscriptions,
} ) => {

  const [
    anchorElement,
    setAnchorElement,
  ] = React.useState( null );

  const handleClick = event => {

    setAnchorElement( event.currentTarget );

  };

  const handleClose = () => {

    setAnchorElement( null );

  };

  const open = Boolean( anchorElement );
  const id   = open
    ? "simple-popover"
    : undefined;

  const handleAccept =  async() => {

    await acceptRequest(
      type,
      expiry,
      database,
      email
    )
      .then( async() => {

        setRequests( methods.removeFromObject(
          requests,
          type
        ) );
        refreshSubscriptions();

      } );

  };

  return (
    <ListItem className="request">
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
        id={id}
        anchorEl={ anchorElement }
        open={ open }
        onClose={ handleClose }
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

                setRequests( methods.removeFromObject(
                  requests,
                  type
                ) );

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
  /** @type {import("@firebase/firestore").Firestore} */ database,
  /** @type {string} */ email
) => {

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
