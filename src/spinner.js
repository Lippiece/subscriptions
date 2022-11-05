import "./spinner.css";

const spinner = document.createElement( "div" );
spinner.classList.add( "container" );
spinner.innerHTML = `
<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
`;

export default spinner;
