/* eslint-disable fp/no-mutation,fp/no-unused-expression,fp/no-nil */
import { css } from "@emotion/css";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";

import renderAdminUI from "./admin";
import methods from "./methods";
import spinner from "./spinner";
import renderUserUI from "./user";

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

    }

    form {
      display        : flex;
      gap            : 0.5em;
      flex-direction : column;
      align-items    : center;
      justify-content: center;

      input {
        background-color: #222;
        color: rgba(255, 255, 255, 0.7)
      }

      input#new-user-sub-length {
        width: 3em;
      }

    }

    * {
      background-color: #222;
      color           : rgba(255, 255, 255, 0.7);
    }
  }` );
document.body.append( methods.renderInfobox() );
const infoText      = document.querySelector( "#info-text" );
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

const getUserType = async email => {

  const database            = getFirestore();
  const adminReference      = doc(
    database,
    "admins",
    email,
  );
  const subscriberReference = doc(
    database,
    "subscriptions",
    email,
  );
  const adminData           = await getDoc( adminReference );
  const subscriberData      = await getDoc( subscriberReference );
  const types               = {
    admin: adminData.data(),
    sub  : subscriberData.data(),
  };

  return Object.keys( types )
    .find( key => types[ key ] );

};

const displayUserData = async () => {

  const auth           = getAuth();
  const greeting       = document.createElement( "p" );
  greeting.id          = "greeting";
  greeting.textContent = `Здравствуйте, ${ auth.currentUser.email }!`;
  document.body.replaceChildren(
    greeting,
    spinner,
  );

  const userType     = await getUserType( auth.currentUser.email );
  const typesActions = {
    admin: renderAdminUI,
    sub  : renderUserUI,
  };
  typesActions[ userType ]();

};
const login = async ( email, password ) => {

  const auth = getAuth();

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await displayUserData();

  } catch ( error ) {

    infoText.textContent = methods.displayError( error );

  }

};
loginForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const email    = loginForm[ "login-email" ].value;
    const password = loginForm[ "login-password" ].value;

    login(
      email,
      password,
    );

  },
);
