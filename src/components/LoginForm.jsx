/* eslint-disable fp/no-nil */
/* eslint-disable consistent-return */
/* eslint-disable fp/no-unused-expression */
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

const LoginForm = ( {
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

      // hide the form

    } catch ( error ) {

      console.error( error );

    }

  };

  return (
    <div
      className="form-container"
      hidden={Boolean( user )}
    >
      <form
        onSubmit={ login }
      >
        <input
          type="email"
          onChange={
            event =>
              setEmail( event.target.value )
          } />
        <input
          type="password"
          onChange={
            event =>
              setPassword( event.target.value )
          } />
        <button
          type="submit">
          Login
        </button>
      </form>
    </div>
  );

};

const getUserType = async email => {

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
  const adminData           = await getDoc( adminReference );
  const subscriberData      = await getDoc( subscriberReference );
  const types               = {
    admin: adminData.data(),
    sub  : subscriberData.data(),
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
export default LoginForm;
