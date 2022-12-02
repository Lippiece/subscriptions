import "../css/SubscribersList.css";

import React from "react";

import methods from "../methods";
import RequestsList from "./RequestsList";

const SubscribersList = ( {
  database,
  subscribers,
  refreshSubscriptions
} ) =>
{

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
              <p>
                Активные подписки:
              </p>
              <ul>

                { data_.subs
                  ? Object.entries( data_.subs )
                    .map( ( [
                      key,
                      value,
                    ] ) =>
                      (
                        <li key= { key }>
                          { `${ key }: ${ methods.timestampToDate( value ) }` }
                        </li>
                      ) )
                  : "Не найдены" }
              </ul>
            </div>
            <RequestsList
              database             = { database }
              email                = { email }
              refreshSubscriptions = { refreshSubscriptions }
            />
          </li>
        );

      } ) }
    </ul>
  );

};

export default SubscribersList;
