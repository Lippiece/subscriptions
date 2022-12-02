/* eslint-disable fp/no-mutation, fp/no-unused-expression,fp/no-nil */
import { initializeApp } from "firebase/app";
import {
  deleteField,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

/* import {
     renderAdminUI, SubscribersList,
   } from "./components/AdminPanel"; */
import { getFirebaseConfig } from "./firebase-config";

const app             = initializeApp( getFirebaseConfig() );
const database        = getFirestore( app );
const getSubscription = async email => {

  try {

    return await getDoc( doc(
      database,
      "subscriptions",
      email
    ) );

  } catch ( error ) {

    console.error( error );

  }

};

const clearRequest = async(
  email, key
) => {

  try {

    const subscription = await getSubscription( email );

    // remove entry containing type from requests
    return await updateDoc(
      doc(
        database,
        "requests",
        email
      ),
      { [ key ]: deleteField() }
    );

  } catch ( error ) {

    console.error( error );
    return infoText.textContent = methods.displayError( error );

  }

};
const createSubscriptionObject = (
  /** @type {string} */ type,
  /** @type {number} */ length
) =>
  ( { [ type ]: incrementDate(
    Date.now(),
    length
  ) } );
const incrementDate            = (
  date, length
) => {

  const output = new Date( date );
  output.setMonth(
    output.getMonth() + length,
    0
  );
  return output;

};
const displayError = error =>  {

  const {
    code, message,
  } = error;
  const errors = {
    "auth/account-exists-with-different-credential":
        "Пользователь с таким email уже существует",
    "auth/credential-already-in-use": "Учетные данные уже используются",
    "auth/email-already-in-use"     : "Email уже используется",
    "auth/invalid-credential"       : "Неверные учетные данные",
    "auth/invalid-email"            : "Неверный email",
    "auth/invalid-verification-code": "Неверный код подтверждения",
    "auth/invalid-verification-id"  : "Неверный идентификатор подтверждения",
    "auth/missing-verification-code": "Отсутствует код подтверждения",
    "auth/missing-verification-id":
        "Отсутствует идентификатор подтверждения",
    "auth/network-request-failed" : "Ошибка сети",
    "auth/operation-not-allowed"  : "Операция не разрешена",
    "auth/timeout"                : "Время ожидания истекло",
    "auth/too-many-requests"      : "Слишком много запросов",
    "auth/user-disabled"          : "Пользователь заблокирован",
    "auth/user-not-found"         : "Пользователь не найден",
    "auth/weak-password"          : "Слабый пароль",
    "auth/wrong-password"         : "Неверный пароль",
    "storage/canceled"            : "Загрузка отменена",
    "storage/object-not-found"    : "Файл не найден",
    "storage/retry-limit-exceeded": "Превышено количество попыток",
    "storage/unauthorized"        : "Нет доступа",
    "storage/unknown"             : "Неизвестная ошибка",
  };
  return errors[ code ] || message;

};
export default {
  addObjectToDatabase: async(
    /** @type {string} */ email,
    /** @type {{}} */ object
  ) => {

    const reference        = doc(
      database,
      "subscriptions",
      email
    );
    const documentSnapshot = await getDoc( reference );
    await setDoc(
      reference,
      { subs: {
        ...documentSnapshot.data()?.subs,
        ...object,
      } }
    );

    // log the document data
    console.log( documentSnapshot.data() );

  },
  createSubscriptionObject,
  displayError,
  getFileName: url => {

    const startString = "%2F";
    const start       = url.indexOf( startString ) + startString.length;
    const end         = url.indexOf( "?" );
    return decodeURI( url.slice(
      start,
      end
    ) );

  },

  incrementDate,
  removeFromArray: (
    array, toRemove
  ) =>
    array.filter( item =>
      item !== toRemove ),
  removeFromObject: (
    /** @type {object} */ object, /** @type {string | number} */ toRemove
  ) => {

    const newObject = { ...object };
    delete newObject[ toRemove ];
    return newObject;

  },
  timestampToDate: timestamp => {

    const date = new Date( timestamp.seconds * 1000 );
    return date.toLocaleString( "ru-RU" )
      .split( "," )[ 0 ];

  },
};
