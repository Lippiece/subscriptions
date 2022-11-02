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

    return console.error( error );

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

    return console.error( error );

  }

};
const listLinks = links => {

  const list = document.createElement( "ul" );
  list.id    = "links-list";
  links.map( link => {

    const listItem     = document.createElement( "li" );
    listItem.innerHTML = `<a href="${ link }">${ methods.getFileName( link ) }</a>`;
    list.append( listItem );

  } );
  return list;

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
const renderUserUI = async() => {

  if ( await subscriptionNotExpired() ) {

    const links = await getDownloadLinks();
    return document.body.replaceChildren( listLinks( links ) );

  }
  const expiryParagraph       = document.createElement( "p" );
  expiryParagraph.id          = "subscription-expired";
  expiryParagraph.textContent = "Ваша подписка истекла.";
  return document.body.append( expiryParagraph );

};
export default renderUserUI;
