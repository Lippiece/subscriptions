import Button from "@mui/material/Button";
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
  email, database, setSubscribers, getSubscriptions,
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
        .then( setRequests );

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
    <div className="requests">
      {
        Boolean( requests )
        && (
          <>
            <p hidden={Object.keys( requests ).length === 0}>
              Запросы:
            </p>
            <ul>
              {Object.entries( requests )
                .map( ( [
                  key,
                  value,
                ] ) =>
                  (
                    <RequestElement
                      key              = { key }
                      type             = { key }
                      expiry           = { value }
                      database         = { database }
                      email            = { email }
                      requests         = { requests }
                      setRequests      = { setRequests }
                      getSubscriptions = { getSubscriptions }
                      setSubscribers   = { setSubscribers }
                    />
                  ) )}
            </ul>
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
  getSubscriptions,
  setSubscribers,
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
        await getSubscriptions( database )
          .then( setSubscribers );

      } );

  };

  return <li className="request">
    <p>
      { `${ type }: ${ methods.timestampToDate( expiry ) }` }
    </p>
    <Button
      onClick={ handleClick }
      variant="outlined"
      size="small"
    >
      Изменить
    </Button>
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

  </li>;

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
