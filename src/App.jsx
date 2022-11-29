/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import { css } from "@emotion/css";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React from "react";

import { AdminPanel } from "./components/AdminPanel";
import LoginForm from "./components/LoginForm";
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

  return (
    <div className="App">
      <ExitButton user={user} />
      <LoginForm user={user} setUser={setUser} />
    </div>
  );

};

const makeForm = () => {

  const loginForm     = document.createElement( "form" );
  loginForm.id        = "login-form";
  loginForm.innerHTML = `
  <label for="login-email">Email</label>
  <input type="email" id="login-email" autocomplete="login-email" />
  <label for="login-password">Пароль</label>
  <input type="password" id="login-password" autocomplete="current-password" />
  <button type="submit">Войти</button>
`;
  document.body.append( loginForm );
  loginForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const email    = loginForm[ "login-email" ].value;
      const password = loginForm[ "login-password" ].value;

      login(
        email,
        password
      );

    }
  );

  return loginForm;

};
const ExitButton = ({user}) => {

  const auth = getAuth();

  return (
    <button
      onClick={ () =>
        signOut( auth ) }
      className="exit-button"
      hidden={!user}
    >
      Выйти
    </button>
  );

};
export default App;
