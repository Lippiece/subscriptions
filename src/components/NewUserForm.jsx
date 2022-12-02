import "../css/forms.css";

import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React from "react";

import methods from "../methods";

const NewUserForm = ( {
  auth,
  userEmail,
  userPassword,
  refreshSubscriptions
} ) => {

  const [
    email,
    setEmail,
  ] = React.useState( "" );
  const [
    password,
    setPassword,
  ] = React.useState( "" );
  const [
    subLength,
    setSubLength,
  ] = React.useState( 0 );
  const [
    subType,
    setSubType,
  ] = React.useState( "A" );
  const [
    info,
    setInfo,
  ] = React.useState( "" );
  const updateUser = async event => {

    event.preventDefault();

    try {

      // check if user exists
      const signIn = await fetchSignInMethodsForEmail(
        auth,
        email
      );
      setInfo( "Обновление подписки" );
      const object = methods.createSubscriptionObject(
        subType,
        subLength
      );
      await methods.addObjectToDatabase(
        email,
        object
      );
      refreshSubscriptions();

      setInfo( "Подписка обновлена" );
      if ( !signIn.includes( "password" ) ) {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await signInWithEmailAndPassword(
          auth,
          userEmail,
          userPassword
        );
        return setInfo( "Пользователь создан" );

      }

    } catch ( error_ ) {

      return setInfo( methods.displayError( error_ ) );

    }

  };

  return (
    <div className="form-container">
      <form onSubmit={updateUser}>
        <input
          type="email"
          onChange={
            event =>
              setEmail( event.target.value )
          }
          placeholder="Email"
          required
          pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
        />
        <input
          id="password"
          type="password"
          onChange={
            event =>
              setPassword( event.target.value )
          }
          placeholder="Пароль"
          minLength={6}
        />
        <input
          type="number"
          onChange={
            event =>
              setSubLength( Number( event.target.value ) )
          }
          placeholder="Срок"
          required
          min="1"
          max="60"
        />
        <select
          onChange={
            event =>
              setSubType( event.target.value )
          } >
          <option>
            A
          </option>
          <option>
            B
          </option>
          <option>
            C
          </option>
        </select>
        <button
          type="submit"
          hidden={( email + password ).length < 10}
        >
          { password.length > 0
            ? "Добавить пользователя"
            : "Изменить подписку"
          }
        </button>
      </form>
      <p
        className="info"
        hidden={ info.length === 0 }>
        { info }
      </p>
    </div>
  );

};

export default NewUserForm;
