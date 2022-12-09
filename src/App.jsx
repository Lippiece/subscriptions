/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import "./css/App.css";

import Button from "@mui/material/Button";
import {
  createTheme, ThemeProvider,
} from "@mui/material/styles";
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

const darkTheme = createTheme( { palette: { mode: "dark" } } );
const App       = () => {

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
    <div
      className="app">
      <ExitButton
        setUser={setUserType}
        user={userType}/>
      <LoginForm
        setUser={ setUserType }
        setUserEmail={ setUserEmail }
        setUserPassword={ setUserPassword }
        user={ userType }
      />
      { userType === "admin"
      && <AdminPanel
        userEmail={ userEmail }
        userPassword={ userPassword }
      /> }
      { userType === "sub"
      && <UserPanel
        email={userEmail} /> }
    </div>
  );

};

const ExitButton = ( {
  user, setUser,
} ) => {

  const auth = getAuth();

  return (
    <ThemeProvider
      theme={ darkTheme }>
      <Button
        className="exit-button"
        hidden={!user}
        onClick={ () => {

          setUser( "" );
          signOut( auth );

        } }
      >
        Выйти
      </Button>
    </ThemeProvider>
  );

};
export default App;
