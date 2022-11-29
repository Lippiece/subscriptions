/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import { css } from "@emotion/css";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React from "react";

import { AdminPanel } from "./components/AdminPanel";
import {
  getUserType, LoginForm,
} from "./components/LoginForm";
import UserPanel from "./components/UserPanel";
import methods from "./methods";
import spinner from "./spinner";

document.body.classList.add( css`
  & {
    font-family     : 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size       : 1.5em;
    gap             : 1.5em;
    display         : flex;
    flex-direction  : column;
    align-items     : center;
    height          : 100vh;
    background-color: #222;

    div#links-container {
      display        : flex;
      flex-direction : column;
      align-items    : center;
      justify-content: center;
      gap            : 0.5em;

      ul {
        display        : flex;
        flex-direction : column;
        align-items    : center;
        justify-content: center;
        gap            : 0.5em;
        list-style     : none;
        padding        : 0;
      }
    }

    form {
      display        : flex;
      gap            : 0.5em;
      flex-direction : column;
      align-items    : center;
      justify-content: center;

      input {
        outline         : none;
        background-color: #222;
        color           : rgba(255, 255, 255, 0.7);
        border          : 1px solid rgba(255, 255, 255, 0.7);
        padding         : 0.5em 1em;

        &:focus {
          outline     : none;
          border-color: #fff;
        }
      }

      input#new-user-sub-length {
        width: 3em;
      }

    }

    * {
      background-color: #222;
      color           : rgba(255, 255, 255, 0.7);
    }

    p[data-expired="true"] {
      color: rgba(255, 90, 90, 0.7);
    }

    p[data-expired="false"] {
      color: rgba(90, 255, 90, 0.7);
    }

    button {
      outline         : none;
      background-color: #222;
      color           : rgba(255, 255, 255, 0.7);
      border          : 1px solid rgba(255, 255, 255, 0.7);
      padding         : 0.5em 1em;
      cursor          : pointer;

      &:hover {
        background-color: #ccc;
        color           : #222;

        &:focus {
          outline: none;

          &:active {
            background-color: #aaa;
            color           : #222;
          }
        }
      }
    }
  }` );
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
    <div className="App">
      <ExitButton user={user} setUser={setUser}/>
      <LoginForm user={ user } setUser={ setUser } />
      { user === "admin" && <AdminPanel /> }
      { user === "user" && <UserPanel /> }
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
