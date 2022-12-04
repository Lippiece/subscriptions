/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import React from "react";

import methods from "../methods";

const UserPanel = () =>
  (
    <>
      <Infobox />
      <LinksList />
      <RequestForm />
    </>
  );
const Infobox   = () => {

  const auth = getAuth();
  return (
    <div
      id="info-container"
    >
      <p
        id="info-text"
      >
        { auth.currentUser?.email }
      </p>
    </div>
  );

};

const LinksList = (  ) => {

  const [
    links,
    setLinks,
  ] = React.useState( [] );
  const getLinks = React.useCallback(
    async() => {

      const auth = getAuth();
      const user = auth.currentUser;
      if ( user ) {

        const database      = getFirestore();
        const userReference = doc(
          database,
          "subscriptions",
          user.email
        );
        const userDocument  = await getDoc( userReference );
        const userData      = userDocument.data();
        const subs          = Object.keys( userData.subs )
          .filter( sub =>
            userData.subs[ sub ] );
        const links_        = await Promise.all( subs.map( type =>
          getLinksByType( type ) ) )
          .then( links__ =>
            links__.flat() );
        setLinks( links_ );

      }

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
      <ul id="links-list">
        { links.map( link =>
          <li key={ link }>
            <a href={ link }>
              { methods.getFileName( link ) }
            </a>
          </li> ) }
      </ul>
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

const RequestForm = () => {

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
  ] = React.useState( 3 );
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
    "1",
    "3",
    "6",
    "12",
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
const listSubscriptionTypes = async() => {

  // get the names of all folders in storage
  const storage    = getStorage();
  const reference  = ref( storage );
  const listResult = await listAll( reference );
  return listResult.prefixes.map( folder =>
    folder.name );

};
const renderRequestsToUser = async() => {

  const auth = getAuth();

  const firestore = getFirestore();
  const document_ = await getDoc( doc(
    firestore,
    "requests",
    auth.currentUser.email
  ) );
  if ( !document_.exists() ) return "";

  const container = document.createElement( "div" );
  container.id    = "requests";
  const list      = document.createElement( "ul" );
  Object.entries( document_.data() )
    .map( ( [
      type,
      length,
    ] ) => {

      const listItem        = document.createElement( "li" );
      const paragraph       = document.createElement( "p" );
      paragraph.textContent = `${ type } на ${ length } месяцев`;
      listItem.append( paragraph );
      list.append( listItem );

    } );
  const info       = document.createElement( "p" );
  info.textContent = "Ваши запросы:";
  container.append( info );
  container.append( list );
  return container;

};
const renderUserUI = async() => {

  const auth = getAuth();

  // get "type" value from user email document
  const firestore     = getFirestore();
  const userReference = doc(
    firestore,
    "subscriptions",
    auth.currentUser.email
  );
  const document_     = await getDoc( userReference );

  const links             = await listLinks( document_.data() );
  const subscriptionsInfo = renderUserSubscriptions( document_.data() );
  const availables        = await RequestForm();
  const requests          = await renderRequestsToUser();
  return document.body.replaceChildren(
    infobox,
    links,
    subscriptionsInfo,
    availables,
    requests
  );

};
export default UserPanel;
