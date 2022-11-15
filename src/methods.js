import { EmailAuthProvider, fetchSignInMethodsForEmail } from "firebase/auth";
/* eslint-disable fp/no-mutation, fp/no-unused-expression */
const fillForm = request => event => {

  event.preventDefault();
  const form = document.querySelector( "#new-user-form" );

  form[ "new-user-email" ].value      = request.user;
  form[ "new-user-sub-length" ].value = request.length;
  form[ "new-user-sub-type" ].value   = request.type;
  form[ "new-user-password" ].value   = "password";
  return form;

};
const createSubscriptionObject = ( type, expiry ) =>  (
  { [ type ]: expiry  } );
const incrementDate            = ( date, length ) => {

  const output = new Date( date );
  output.setMonth( output.getMonth() + length );
  return output;

};
const displayError = error =>  {

  const { code, message } = error;
  const errors            = {
    "auth/account-exists-with-different-credential":
        "Пользователь с таким email уже существует",
    "auth/credential-already-in-use": "Учетные данные уже используются",
    "auth/email-already-in-use"     : "Email уже используется",
    "auth/invalid-credential"       : "Неверные учетные данные",
    "auth/invalid-email"            : "Неверный email",
    "auth/invalid-verification-code": "Неверный код подтверждения",
    "auth/invalid-verification-id"  : "Неверный идентификатор подтверждения",
    "auth/missing-verification-code": "Отсутствует код подтверждения",
    "auth/missing-verification-id"  :
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
    "storage/quota-exceeded"      : "Превышен лимит хранилища",
    "storage/retry-limit-exceeded": "Превышено количество попыток",
    "storage/unauthorized"        : "Нет доступа",
    "storage/unknown"             : "Неизвестная ошибка",
  };
  return errors[ code ] || message;

};
export default {
  createSubscriptionObject,
  displayError,
  fillForm,
  getFileName: url => {

    const start = url.indexOf( "%2F" ) + "%2F".length;
    const end   = url.indexOf( "?" );
    return decodeURI( url.slice(
      start,
      end,
    ) );

  },
  incrementDate,
  renderForm: (
    auth,
    createUserWithEmailAndPassword,
    addObjectToDatabase,
  ) => {

    const newUserForm     = document.createElement( "form" );
    newUserForm.id        = "new-user-form";
    newUserForm.innerHTML = `
      <label for="new-user-email">Email</label>
      <input type="email" id="new-user-email" />
      <label for="new-user-password">Пароль</label>
      <input type="password" id="new-user-password" />
      <label for="new-user-sub-length">Длительность подписки (мес.)</label>
      <input type="number" id="new-user-sub-length" />
      <label for="new-user-sub-type">Тип подписки</label>
      <select id="new-user-sub-type">
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>
      <button type="submit">Зарегистрировать</button>
    `;

    newUserForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        const email    = newUserForm[ "new-user-email" ].value;
        const password = newUserForm[ "new-user-password" ].value;
        const length   = Number( newUserForm[ "new-user-sub-length" ].value );
        const type     = newUserForm[ "new-user-sub-type" ].value;

        try {

          // check if user exists
          const signIn = await fetchSignInMethodsForEmail(
            auth,
            email,
          );
          if ( signIn.includes( "password" ) ) {

            await addObjectToDatabase(
              email,
              createSubscriptionObject(
                type,
                incrementDate(
                  new Date(),
                  length,
                ),
              ),
            );

            const paragraph       = document.createElement( "p" );
            paragraph.textContent = `${ type }: ${ incrementDate(
              new Date(),
              length,
            ) }`;
            return document.querySelector( `li[data-email="${ email }"]` )
              .append( paragraph );

          }

          return await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          );

        } catch ( error ) {

          return document.querySelector( "#info-text" ).textContent = displayError( error );

        }

      },
    );
    return newUserForm;

  },

  renderInfobox: () => {

    const container = document.createElement( "div" );
    container.id    = "info-container";
    const paragraph = document.createElement( "p" );
    paragraph.id    = "info-text";
    container.append( paragraph );
    return container;

  },

  /**
   * Render incoming requests
   * positioned to the right of the corresponding users
   * with button to accept which fills the form
   */
  renderRequest: request => {

    const requestContainer = document.createElement( "div" );
    requestContainer.classList.add( "request-container" );
    const acceptButton = document.createElement( "button" );
    requestContainer.append( acceptButton );
    acceptButton.textContent = "Принять";
    const requestContent     = [
      `Срок: ${ request.length }`,
      `Тип: ${ request.type }`,
    ];
    requestContent.map( item => {

      const paragraph       = document.createElement( "p" );
      paragraph.textContent = item;
      requestContainer.append( paragraph );
      return paragraph;

    } );
    acceptButton.addEventListener(
      "click",
      event => fillForm( request )( event ),
    );
    return document.querySelector( `li[data-email="${ request.user }"]` )
      .append( requestContainer );

  },
  setDocMock: ( doc, data ) => {

    doc.data = () => data;
    return doc;

  },
  timestampToDate: timestamp => {

    const date = new Date( timestamp.seconds * 1000 );
    return date.toLocaleString( "ru-RU" )
      .split( "," )[ 0 ];

  },
};
