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

export const LoginForm = ( {
  user, setUser,
} ) => {

  const [
    email,
    setEmail,
  ]       = React.useState( "" );
  const [
    password,
    setPassword,
  ] = React.useState( "" );
  const login = async event => {

    event.preventDefault();
    const auth = getAuth();

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userType = await getUserType( email );
      setUser( userType );

    } catch ( error ) {

      console.error( error );

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
          Login
        </button>
      </form>
    </div>
  );

};

export const getUserType = async email => {

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

const displayUserData = async() => {

  const auth           = getAuth();
  const greeting       = document.createElement( "p" );
  greeting.textContent = `Здравствуйте, ${ auth.currentUser.email }!`;
  document.body.replaceChildren(
    greeting,
    spinner
  );

  const userType     = await getUserType( auth.currentUser.email );
  const typesActions = {
    admin: AdminPanel,
    sub  : UserPanel,
  };
  typesActions[ userType ]();

};
