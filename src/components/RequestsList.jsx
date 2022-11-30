import {
 doc, getDoc
} from "firebase/firestore";
import React from "react";

import methods from "../methods";

const RequestsList = ( {
  email, database,
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
    <ul className="requests">
      {
        Boolean( requests )
          && Object.entries( requests )
            .map( ( [
              key,
              value,
            ] ) =>
              (
                <RequestElement
                  key={ key }
                  type={key}
                  expiry={ value }
                />
              ) )
      }
    </ul>
  );

};
/**
   * Render incoming requests
   * positioned to the right of the corresponding users
   * with button to accept which fills the form
   */
const RequestElement = ( {
  type, expiry,
} ) =>
  (
    <li>
      <div className="request">
        <p>
          { `${ type }: ${ methods.timestampToDate( expiry ) }` }
        </p>
        <button
          type="button"
          onClick={ () => {
          /* const form = document.getElementById( "form" );
             form.elements[ "email" ].value = request.email;
             form.elements[ "name" ].value = request.name; */
          }
          }
        >
          Принять
        </button>
      </div>

    </li>
  );

// Get subscription requests for a user and return them as an array
const getRequests = async(
  database, email
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

export default RequestsList;
