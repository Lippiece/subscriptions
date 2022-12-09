/* eslint-disable fp/no-unused-expression */
import "../css/forms.css";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  createTheme, ThemeProvider,
} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getStorage, listAll, ref,
} from "firebase/storage";
import React from "react";

import methods from "../methods";

const darkTheme   = createTheme( { palette: { mode: "dark" } } );
const NewUserForm = ( {
  auth,
  userEmail,
  userPassword,
  refreshSubscriptions,
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
  const [
    hidden_,
    setHidden,
  ] = React.useState( true );
  const [
    types,
    setTypes,
  ] = React.useState( [] );
  const refreshTypes = React.useCallback(
    async() => {

      await listFolders()
        .then( setTypes );

    },
    []
  );
  React.useEffect(
    () => {

      refreshTypes();

    },
    [ refreshTypes ]
  );
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
        console.log( "user created" );
        await signOut( auth );
        console.log( "user signed out" );
        console.log(
          "Trying to login with:",
          userEmail,
          userPassword
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
  const numberInputProperties = {
    max: 60,
    min: 1,
  };

  return (
    <ThemeProvider
      theme={ darkTheme }
    >
      <div
        className="form-container">
        <Button
          id="hide-button"
          onClick={
            () =>
              setHidden( !hidden_ )
          }
        >
          {`${ hidden_
            ? "Показать"
            : "Скрыть" } форму`}
        </Button>
        <form
          hidden={ hidden_ }
          onSubmit={ updateUser }
        >
          <TextField
            label="Email"
            onChange={
              event =>
                setEmail( event.target.value )
            }
            pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            required
            size="small"
            type="email"
          />
          <TextField
            id="password"
            label = "Пароль"
            minLength={6}
            onChange={
              event =>
                setPassword( event.target.value )
            }
            size  = "small"
            type  = "password"
          />
          <TextField
            inputProps={ numberInputProperties }
            label="Срок"
            onChange={
              event =>
                setSubLength( Number( event.target.value ) )
            }
            required
            size="small"
            type="number"
          />
          <Select
            onChange={
              event =>
                setSubType( event.target.value )
            } >
            { types.map( type =>
              <MenuItem
                key={ type }
                value={ type }>
                { type }
              </MenuItem> ) }
          </Select>
          <Button
            hidden={( email + password ).length < 10}
            type="submit"
          >
            { password.length > 0
              ? "Добавить пользователя"
              : "Изменить подписку"
            }
          </Button>
        </form>
        <p
          className="info"
          hidden={ info.length === 0 }>
          { info }
        </p>
      </div>
    </ThemeProvider>
  );

};
const listFolders = async() => {

  const storage    = getStorage();
  const reference  = ref( storage );
  const listResult = await listAll( reference );
  return listResult.prefixes.map( folder =>
    folder.name );

};

export default NewUserForm;
