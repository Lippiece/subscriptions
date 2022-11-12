/* eslint-disable fp/no-mutation, fp/no-unused-expression */
export default {
  displayError: ( error ) =>  {

    const { code, message } = error;
    const errors            = {
      "auth/account-exists-with-different-credential": "Пользователь с таким email уже существует",
      "auth/credential-already-in-use"               : "Учетные данные уже используются",
      "auth/email-already-in-use"                    : "Email уже используется",
      "auth/invalid-credential"                      : "Неверные учетные данные",
      "auth/invalid-email"                           : "Неверный email",
      "auth/invalid-verification-code"               : "Неверный код подтверждения",
      "auth/invalid-verification-id"                 : "Неверный идентификатор подтверждения",
      "auth/missing-verification-code"               : "Отсутствует код подтверждения",
      "auth/missing-verification-id"                 : "Отсутствует идентификатор подтверждения",
      "auth/network-request-failed"                  : "Ошибка сети",
      "auth/operation-not-allowed"                   : "Операция не разрешена",
      "auth/timeout"                                 : "Время ожидания истекло",
      "auth/too-many-requests"                       : "Слишком много запросов",
      "auth/user-disabled"                           : "Пользователь заблокирован",
      "auth/user-not-found"                          : "Пользователь не найден",
      "auth/weak-password"                           : "Слабый пароль",
      "auth/wrong-password"                          : "Неверный пароль",
      "storage/canceled"                             : "Загрузка отменена",
      "storage/object-not-found"                     : "Файл не найден",
      "storage/quota-exceeded"                       : "Превышен лимит хранилища",
      "storage/retry-limit-exceeded"                 : "Превышено количество попыток",
      "storage/unauthorized"                         : "Нет доступа",
      "storage/unknown"                              : "Неизвестная ошибка",
    };
    return errors[ code ] || message;

  },
  getFileName: ( url ) => {

    const start = url.indexOf( "%2F" ) + "%2F".length;
    const end   = url.indexOf( "?" );
    return decodeURI( url.slice(
      start,
      end,
    ) );

  },
  incrementDate: ( input, months ) => {

    const output = new Date( input );
    output.setMonth( output.getMonth() + months );
    return output;

  },
  renderInfobox: () => {

    const container = document.createElement( "div" );
    container.id    = "info-container";
    const paragraph = document.createElement( "p" );
    paragraph.id    = "info-text";
    container.append( paragraph );
    return container;

  },
  setDocMock: ( doc, data ) => {

    doc.data = () => data;
    return doc;

  },
  timestampToDate: ( timestamp ) => {

    const date = new Date( timestamp.seconds * 1000 );
    return date.toLocaleString( "ru-RU" )
      .split( "," )[ 0 ];

  },
};
