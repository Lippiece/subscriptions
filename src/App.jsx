/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import "./css/App.css";
import { css } from "@emotion/css";
import {
  getAuth,
  signOut,
} from "firebase/auth";
import React from "react";

import AdminPanel from "./components/AdminPanel";
import {
  getUserType, LoginForm,
} from "./components/LoginForm";
import UserPanel from "./components/UserPanel";

const App = () => {

  const [
    user,
    setUser,
  ] = React.useState( "" );

  // check if already logged in
  React.useEffect(
    () => {

      const auth = getAuth();

      auth.onAuthStateChanged( async authUser => {

        if ( authUser ) {

          const type = await getUserType( authUser.email );
          setUser( type );

        }

      } );

    },
    []
  );

  return (
    <div className="app">
      <ExitButton
        user={user}
        setUser={setUser}/>
      <LoginForm
        user={ user }
        setUser={ setUser } />
      { user === "admin" && <AdminPanel /> }
      { user === "sub" && <UserPanel /> }
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
