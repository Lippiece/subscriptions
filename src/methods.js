const getFileName = url => {

  const start = url.indexOf( "%2F" ) + 3;
  const end   = url.indexOf( "?" );
  return decodeURI( url.slice( start, end ) );

};
export default { getFileName };
