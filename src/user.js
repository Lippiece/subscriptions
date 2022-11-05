/* eslint-disable fp/no-nil, fp/no-mutation, fp/no-unused-expression */
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";

import methods from "./methods";

const infoText = document.querySelector( "#info-text" );

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

    infoText.textContent = methods.displayError( error );

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

    infoText.textContent = methods.displayError( error );

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
const renderUserUI = async() => {

  if ( await subscriptionNotExpired() ) {

    const links = await getDownloadLinks();
    return document.body.replaceChildren( listLinks( links ) );

  }

  return infoText.textContent = "Ваша подписка истекла";

};
export default renderUserUI;
