import "../css/SubscribersList.css";

import {
  collection,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import React from "react";

import methods from "../methods";
import RequestsList from "./RequestsList";

const SubscribersList  = ( { database } ) => {

  const [
    subscribers,
    setSubscribers,
  ] = React.useState( [] );
  const getData = React.useCallback(
    async() => {

      await getSubscriptions( database )
        .then( setSubscribers );

    },
    []
  );
  React.useEffect(
    () => {

      const data = getData();

    },
    [ getData ]
  );
  return (
    <ul
      id="subscriptions"
    >
      { subscribers.map( subscriber => {

        const [
          email,
          data_,
        ] = subscriber;
        return (
          <li
            key={ email }
          >
            <p>
              { email }
            </p>
            <div
              className="subscriptions"
            >
              { Object.keys( data_ ).length > 0
                ? Object.entries( data_.subs )
                  .map( ( [
                    key,
                    value,
                  ] ) =>
                    (
                      <p key= { key }>
                        { `${ key }: ${ methods.timestampToDate( value ) }` }
                      </p>
                    ) )
                : undefined }
            </div>
            <RequestsList
              database={database}
              email={email} />
          </li>
        );

      } ) }
    </ul>
  );

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

export default SubscribersList;
