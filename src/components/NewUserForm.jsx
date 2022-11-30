import React from "react";

const NewUserForm = () => {

  const [
    email,
    setEmail,
  ]       = React.useState( "" );
  const [
    password,
    setPassword,
  ] = React.useState( "" );
  const [
    subLength,
    setSubLength,
  ] = React.useState( "" );
  const [
    subType,
    setSubType,
  ] = React.useState( "" );
  return (
    <div className="form-container">
      <form>
        <input
          type="email"
          onChange={
            event =>
              setEmail( event.target.value )
          }
          placeholder="Email"
        />
        <input
          id="password"
          type="password"
          onChange={
            event =>
              setPassword( event.target.value )
          }
          placeholder="Пароль"
        />
        <input
          type="number"
          onChange={
            event =>
              setSubLength( event.target.value )
          }
          placeholder="Срок"
        />
        <select
          onChange={
            event =>
              setSubType( event.target.value )
          } >
          <option>
            A
          </option>
          <option>
            B
          </option>
          <option>
            C
          </option>
        </select>
        <button
          type="submit"
          hidden={email.length < 4}
        >
          { password.length > 0
            ? "Добавить пользователя"
            : "Изменить подписку"
          }
        </button>
      </form>
    </div>
  );

};

export default NewUserForm;
