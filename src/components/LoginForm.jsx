/* eslint-disable fp/no-nil */
/* eslint-disable consistent-return */
/* eslint-disable fp/no-unused-expression */
import "../css/forms.css";

import
{
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import React from "react";

import methods from "../methods";

export const LoginForm = ( {
  user,
  setUser,
  setUserEmail,
  setUserPassword,
} ) => {

  const [
    operatorEmail,
    setEmail,
  ]       = React.useState( "" );
  const [
    operatorPassword,
    setPassword,
  ] = React.useState( "" );
  const [
    info,
    setInfo,
  ] = React.useState( "" );
  const login = async event => {

    event.preventDefault();
    const auth = getAuth();

    try {

      await signInWithEmailAndPassword(
        auth,
        operatorEmail,
        operatorPassword
      );
      setInfo( "Вход выполнен" );
      setUserEmail( operatorEmail );
      setUserPassword( operatorPassword );
      const userType = await getUserType( operatorEmail );
      setUser( userType );

    } catch ( error ) {

      setInfo( methods.displayError( error ) );

    }

  };

  return (
    <div
      className="form-container"
      hidden={Boolean( user )} >
      <form
        onSubmit={ login }
      >
        <input
          type="email"
          onChange={
            event =>
              setEmail( event.target.value )
          }
          placeholder="Email"
        />
        <input
          type="password"
          onChange={
            event =>
              setPassword( event.target.value )
          }
          placeholder="Пароль"
        />
        <button
          type="submit">
          Войти
        </button>
      </form>
      <p
        className="info"
        hidden={!info}
      >
        {info}
      </p>
    </div>
  );

};

export const getUserType = async( /** @type {string} */ email ) => {

  const database            = getFirestore();
  const adminReference      = doc(
    database,
    "admins",
    email
  );
  const subscriberReference = doc(
    database,
    "subscriptions",
    email
  );
  const adminDocument       = await getDoc( adminReference );
  const subscriberDocument  = await getDoc( subscriberReference );
  const types               = {
    admin: adminDocument.data(),
    sub  : subscriberDocument.data(),
  };

  return Object.keys( types )
    .find( key =>
      types[ key ] );

};
