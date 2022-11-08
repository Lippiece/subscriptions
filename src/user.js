/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";

import methods from "./methods";

const infobox  = methods.renderInfobox();
const infoText = infobox.querySelector( "#info-text" );

const getFiles = async() => {

  const auth = getAuth();

  // get "type" value from user email document
  const firestore        = getFirestore();
  const userReference    = doc( firestore, "subscriptions", auth.currentUser.email );
  const userData         = await getDoc( userReference );
  const subscriptionType = userData.data().type;

  // get files from storage
  const storage       = getStorage();
  const pathReference = ref( storage, subscriptionType );

  try {

    const listResult = await listAll( pathReference );
    return listResult.items;

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};

// list download links for files
const getDownloadLinks = async() => {

  const files    = await getFiles();
  const promises = files.map( file =>
    getDownloadURL( ref( file ) )  );

  try {

    return await Promise.all( promises );

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};
const listLinks = links => {

  const container  = document.createElement( "div" );
  container.id     = "links-container";
  const info       = document.createElement( "p" );
  info.textContent = "Ссылки на файлы:";
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
const subscriptionNotExpired = async() => {

  const auth = getAuth();

  // get "expires" value from user email document
  const firestore             = getFirestore();
  const userReference         = doc( firestore, "subscriptions", auth.currentUser.email );
  const userData              = await getDoc( userReference );
  const subscriptionDate      = userData.data().expires.seconds;
  const subscriptionTimestamp = new Date( subscriptionDate * 1000 )
    .getTime();

  // check if subscription date is in the past
  return subscriptionTimestamp > Date.now();

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
  const info       = document.createElement( "p" );
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
const requestSubscription = async( type, length ) => {

  const auth = getAuth();

  const firestore         = getFirestore();
  const documentReference = doc( firestore, "requests", auth.currentUser.email );

  try {

    await setDoc( documentReference, {
      length,
      type,
    } );
    return infoText.textContent = "Запрос на подписку отправлен";

  } catch ( error ) {

    return infoText.textContent = methods.displayError( error );

  }

};

const renderLengthOption = ( option, lengthSelector ) => {

  const optionElement       = document.createElement( "option" );
  optionElement.value       = option;
  optionElement.textContent = option;
  lengthSelector.append( optionElement );

};
const renderSubscriptionOption = ( sub, typeSelector ) => {

  const option       = document.createElement( "option" );
  option.value       = sub.textContent;
  option.textContent = sub.textContent;
  typeSelector.append( option );

};
const submitRequest = ( event, form ) => {

  event.preventDefault();
  const type           = form.querySelector( "#request-type" ).value;
  const length         = form.querySelector( "#request-length" ).value;
  infoText.textContent = "Отправка запроса...";
  return requestSubscription( type, length );

};
const renderRequestForm = async() => {

  const subs          = await listSubscriptionTypes();
  const form          = document.createElement( "form" );
  form.id             = "request-form";
  const typeSelector  = document.createElement( "select" );
  typeSelector.id     = "request-type";
  const subsList      = subs.querySelector( "#subs-list" );
  const subsListItems = [ ...subsList.querySelectorAll( "li" ) ];
  subsListItems.map( sub =>
    renderSubscriptionOption( sub, typeSelector ) );
  const lengthSelector = document.createElement( "select" );
  lengthSelector.id    = "request-length";
  const options        = [ "1", "3", "6", "12" ];
  options.map( option =>
    renderLengthOption( option, lengthSelector ) );
  const submit       = document.createElement( "button" );
  submit.id          = "request-submit";
  submit.type        = "submit";
  submit.textContent = "Отправить запрос";
  form.append( typeSelector );
  form.append( lengthSelector );
  form.append( submit );

  form.addEventListener( "submit", event =>
    submitRequest( event, form ) );

  return form;

};
const renderUserUI = async() => {

  if ( await subscriptionNotExpired() ) {

    const links = listLinks( await getDownloadLinks() );
    const subs  = await listSubscriptionTypes();
    const form  = await renderRequestForm();
    return document.body.replaceChildren( infobox, links, subs, form );

  }

  document.body.replaceChildren( infobox );

  // TODO: Хорошо бы сделать кнопку "продлить подписку"
  return infoText.textContent = "Ваша подписка истекла";

};

export default renderUserUI;
