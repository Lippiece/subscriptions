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

const Infobox                 = () =>
  (
    <div
      id="info-container"
    >
      <p
        id="info-text"
      >
        User
      </p>
    </div>
  );
const handleUserSubscriptions = userData => {

  if ( Object.keys( userData ).length === 0 ) return "";
  return Object.keys( userData.subs )
    .reduce(
      (
        accumulator, sub
      ) => {

        if ( userData.subs[ sub ] ) {

          const paragraph       = document.createElement( "p" );
          const expires         = new Date( userData
            .subs[ sub ].seconds * 1000 );
          paragraph.textContent = `Подписка ${ sub } истекает ${ expires
            .toLocaleString( "ru" )
            .split( "," )[ 0 ] }`;

          paragraph.dataset.expired = false;
          if ( new Date() > expires ) {

            paragraph.dataset.expired = true;

          }
          accumulator.append( paragraph );

        }
        return accumulator;

      },
      document.createElement( "div" )
    );

};

const getFilesLinksByType = async subscriptionType => {

  const storage       = getStorage();
  const pathReference = ref(
    storage,
    subscriptionType
  );

  const listResult = await listAll( pathReference );
  if ( listResult.items.length === 0 ) {

    infoText.textContent = "Нет файлов для скачивания";
    return;

  }
  const links = listResult.items.map( item =>
    item.fullPath );
  return links.map( link =>
    `https://firebasestorage.googleapis.com/v0/b/${ storage.bucket }/o/${ encodeURIComponent( link ) }?alt=media` );

};

const renderLinks = links => {

  const container  = document.createElement( "div" );
  container.id     = "links-container";
  const info       = document.createElement( "p" );
  info.textContent = "Файлы из ваших подписок:";
  const list       = document.createElement( "ul" );
  links.map( link => {

    const listItem     = document.createElement( "li" );
    const anchor       = document.createElement( "a" );
    anchor.href        = link;
    anchor.textContent = methods.getFileName( link );
    listItem.append( anchor );
    list.append( listItem );

  } );
  container.append( info );
  container.append( list );
  return container;

};

// list download links for files
const listLinks = async data => {

  if ( Object.keys( data ).length === 0 ) {

    const paragraph       = document.createElement( "p" );
    paragraph.textContent = "Нет активных подписок";
    return paragraph;

  }
  const { subs } = data;
  const links    = await Promise.all( Object.keys( subs )
    .map( async sub => {

      // check if subscription is not expired and exists
      if ( new Date() < new Date( subs?.[ sub ]?.seconds * 1000 ) ) {

        return await getFilesLinksByType( sub );

      }

    } ) );
  return renderLinks( links.flat()
    .filter( Boolean ) );

};

// gets userData with all subscriptions and returns true if any of them is active
const subscriptionsNotExpired = data => {

  const { subs } = data;
  return Object.values( subs )
    .some( expires => {

      const now = new Date();
      return now < new Date( expires.seconds * 1000 );

    } );

};
const listSubscriptionTypes = async() => {

  // get the names of all folders in storage
  const storage       = getStorage();
  const reference     = ref( storage );
  const listResult    = await listAll( reference );
  const subscriptions = listResult.prefixes.map( folder =>
    folder.name );

  // DOM
  const container = document.createElement( "div" );
  const list      = document.createElement( "ul" );
  list.id         = "subs-list";
  subscriptions.map( sub => {

    const listItem        = document.createElement( "li" );
    const paragraph       = document.createElement( "p" );
    paragraph.textContent = sub;
    listItem.append( paragraph );
    list.append( listItem );

  } );
  const info = document.createElement( "p" );
  if ( subscriptions.length === 0 ) {

    info.textContent = "Вы подписаны на все доступные подписки";

  }
  info.textContent = "Доступные подписки:";
  container.append( info );
  container.append( list );
  return container;

};

/**
 * Create request to subscribe
 * to one of the available subscriptions
 * by creating a new document in the "requests" collection
 */
const requestSubscription = async(
  type, length
) => {

  const auth = getAuth();

  const firestore         = getFirestore();
  const documentReference = doc(
    firestore,
    "requests",
    auth.currentUser.email
  );

  try {

    /* document structure: "subs" object: { "type": "length" }
       if document exists, add a field to the "subs" object */
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
        { subs: { [ type ]: length } }
      );
    document.querySelector( "#requests" )
      .replaceWith( await renderRequestsToUser() );
    return infoText.textContent = "Запрос на подписку отправлен";

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};

const renderLengthOption = (
  option, lengthSelector
) => {

  const optionElement       = document.createElement( "option" );
  optionElement.value       = option;
  optionElement.textContent = option;
  lengthSelector.append( optionElement );

};
const renderSubscriptionOption = (
  sub, typeSelector
) => {

  const option       = document.createElement( "option" );
  option.value       = sub.textContent;
  option.textContent = sub.textContent;
  typeSelector.append( option );

};
const submitRequest = (
  event, form
) => {

  event.preventDefault();
  const type           = form.querySelector( "#request-type" ).value;
  const length         = form.querySelector( "#request-length" ).value;
  infoText.textContent = "Отправка запроса...";
  return requestSubscription(
    type,
    Number( length )
  );

};
const renderRequestForm = async() => {

  const subs = await listSubscriptionTypes();
  if ( subs.children.length === 0 ) {

    const paragraph       = document.createElement( "p" );
    paragraph.textContent = "Вы подписаны на все доступные подписки";
    return paragraph;

  }
  const form          = document.createElement( "form" );
  form.id             = "request-form";
  const typeSelector  = document.createElement( "select" );
  typeSelector.id     = "request-type";
  const subsList      = subs.querySelector( "#subs-list" );
  const subsListItems = [ ...subsList.querySelectorAll( "li" ) ];
  subsListItems.map( sub =>
    renderSubscriptionOption(
      sub,
      typeSelector
    ) );
  const lengthSelector = document.createElement( "select" );
  lengthSelector.id    = "request-length";
  const options        = [
    "1",
    "6",
    "12",
  ];
  options.map( option =>
    renderLengthOption(
      option,
      lengthSelector
    ) );
  const submit       = document.createElement( "button" );
  submit.id          = "request-submit";
  submit.type        = "submit";
  submit.textContent = "Отправить запрос";
  form.append( typeSelector );
  form.append( lengthSelector );
  form.append( submit );

  form.addEventListener(
    "submit",
    event =>
      submitRequest(
        event,
        form
      )
  );

  return form;

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
  const subscriptionsInfo = handleUserSubscriptions( document_.data() );
  const availables        = await renderRequestForm();
  const requests          = await renderRequestsToUser();
  return document.body.replaceChildren(
    infobox,
    links,
    subscriptionsInfo,
    availables,
    requests
  );

};
const UserPanel = () =>
  (
    <Infobox/>
  );
export default UserPanel;
