/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import "./css/App.css";

import {
  getAuth,
  signOut,
} from "firebase/auth";
import React from "react";

import AdminPanel from "./components/AdminPanel";
import {
  getUserType,
  LoginForm,
} from "./components/LoginForm";
import UserPanel from "./components/UserPanel";

const App = () => {

  const [
    userType,
    setUserType,
  ] = React.useState( "" );
  const [
    userEmail,
    setUserEmail,
  ] = React.useState( "" );
  const [
    userPassword,
    setUserPassword,
  ] = React.useState( "" );

  // check if already logged in
  React.useEffect(
    () => {

      const auth = getAuth();

      auth.onAuthStateChanged( async authUser => {

        if ( authUser ) {

          const type /* :string */ = await getUserType( String( authUser.email ) );
          setUserType( type );

        }

      } );

    },
    []
  );

  return (
    <div className="app">
      <ExitButton
        user={userType}
        setUser={setUserType}/>
      <LoginForm
        user={ userType }
        setUser={ setUserType }
        setUserEmail={ setUserEmail }
        setUserPassword={ setUserPassword }
      />
      { userType === "admin"
      && <AdminPanel
        userEmail={ userEmail }
        userPassword={ userPassword }
      /> }
      { userType === "sub"
      && <UserPanel /> }
    </div>
  );

};

const ExitButton = ( {
  user, setUser,
} ) => {

  const auth = getAuth();

  return (
    <button
      onClick={ () => {

        setUser( "" );
        signOut( auth );

      } }
      className="exit-button"
      hidden={!user}
    >
      Выйти
    </button>
  );

};
export default App;
