/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import React from "react";

import methods from "../methods";
import fileIcon from "../svg/file-regular.svg";

const UserPanel = ( { email } ) => {

  const [
    requests,
    setRequests,
  ] = React.useState( [] );
  const updateRequests = React.useCallback(
    async() => {

      // get a document from firebase/requests with the name of the user's email
      const auth = getAuth();
      const user = auth.currentUser;
      if ( user ) {

        const database      = getFirestore();
        const userReference = doc(
          database,
          "requests",
          user.email
        );
        const userDocument  = await getDoc( userReference );
        const userData      = userDocument.data();
        setRequests( methods.stringifyRequestDocument( userData ) );

      }

    },
    []
  );
  React.useEffect(
    () => {

      updateRequests();

    },
    [ updateRequests ]
  );

  return <>
    <LinksList />
    <RequestForm
      updateRequests={updateRequests}
    />
    <RequestsList
      setRequests={setRequests}
      requests={requests}
    />
  </>;

};
const LinksList = (  ) => {

  const [
    links,
    setLinks,
  ] = React.useState( [] );
  const getLinks = React.useCallback(
    async() => {

      const auth          = getAuth();
      const user          = auth.currentUser;
      const database      = getFirestore();
      const userReference = doc(
        database,
        "subscriptions",
        user.email
      );
      const userDocument  = await getDoc( userReference );
      const userData      = userDocument.data();
      const filteredSubs  = methods.filterExpiredSubs( userData.subs );
      const typesToRender = Object.keys( filteredSubs );

      const links_ = await Promise.all( typesToRender.map( type =>
        getLinksByType( type ) ) )
        .then( links__ =>
          links__.flat() );
      setLinks( links_ );

    },
    []
  );
  React.useEffect(
    () => {

      getLinks();

    },
    [ getLinks ]
  );
  return (
    <div className="links">

      <p>
        Ссылки на файлы из ваших подписок:
      </p>
      <List>
        { links.map( link =>
          <ListItem key={ link }>
            <ListItemIcon
              sx={{
                height  : "2em",
                minWidth: "auto",
              }}
            >
              <img
                src={ fileIcon }
                alt="file" />
            </ListItemIcon>
            <ListItemButton
              component="a"
              href={ link }
            >
              <ListItemText
                primary={ methods.getFileName( link ) }
              />
            </ListItemButton>
          </ListItem> ) }
      </List>
    </div>
  );

};
/* returns array of strings with links to files
   must resolve getDownloadURL, which returns a promise, for each file */
const getLinksByType = async( /** @type {string} */ type ) => {

  const storage    = getStorage();
  const reference  = ref(
    storage,
    type
  );
  const listResult = await listAll( reference );
  return await Promise.all( listResult.items.map( file =>
    getDownloadURL( file ) ) );

};

const RequestForm = ( { updateRequests } ) => {

  const [
    types,
    setTypes,
  ] = React.useState( [] );
  const [
    type,
    setType,
  ] = React.useState( "A" );
  const [
    length,
    setLength,
  ] = React.useState( 1 );
  const [
    info,
    setInfo,
  ] = React.useState( "" );
  const getTypes = React.useCallback(
    async() => {

      await listSubscriptionTypes()
        .then( setTypes );

    },
    []
  );
  React.useEffect(
    () => {

      getTypes();

    },
    [ types ]
  );
  const lengths = [
    1,
    3,
    6,
    12,
  ];

  const makeRequest = async event => {

    event.preventDefault();
    const auth = getAuth();

    const firestore         = getFirestore();
    const documentReference = doc(
      firestore,
      "requests",
      auth.currentUser.email
    );

    try {

      const document_ = await getDoc( documentReference );
      document_.exists()
        ? await updateDoc(
          documentReference,
          {
            ...document_.data(),
            [ type ]: length,
          }
        )
        : await setDoc(
          documentReference,
          { [ type ]: length }
        );
      setInfo( "Запрос отправлен" );
      updateRequests();

    } catch ( error ) {

      console.error(
        methods.displayError( error ),
        error
      );
      setInfo( methods.displayError( error ) );

    }

  };

  return (
    <form
      id="request-form"
      onSubmit={makeRequest}
    >
      <select
        id="request-type"
        onChange={event =>
          setType( event.target.value )}
      >
        { types.map( type =>
          (
            <option
              value={ type }
              key={ type }
            >
              { type }
            </option>
          ) ) }
      </select>
      <select
        id="request-length"
        onChange={ event =>
          setLength( Number( event.target.value ) ) }
      >
        { lengths.map( length =>
          (
            <option
              value={ length }
              key={ length }
            >
              { length }
            </option>
          ) ) }
      </select>
      <button
        id="request-submit"
        type="submit"
      >
        Отправить запрос
      </button>
      <p hidden={ info === "" }>
        { info }
      </p>
    </form>
  );

};
const RequestsList          = ( { requests } ) =>
  (
    <div
      className="requests"
      hidden={ requests.length === 0 }
    >
      <p>
        Запросы на подписки:
      </p>
      <List>
        { requests.map( ( /** @type {string} */ request ) =>
          <ListItem key={ request }>
            <ListItemText
              primary={ request }
            />
          </ListItem> ) }
      </List>
    </div>
  );
const listSubscriptionTypes = async() => {

  // get the names of all folders in storage
  const storage    = getStorage();
  const reference  = ref( storage );
  const listResult = await listAll( reference );
  return listResult.prefixes.map( folder =>
    folder.name );

};
export default UserPanel;
