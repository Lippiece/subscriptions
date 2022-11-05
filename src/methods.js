const getFileName = url => {

  const start = url.indexOf( "%2F" ) + 3;
  const end   = url.indexOf( "?" );
  return decodeURI( url.slice( start, end ) );

};
const timestampToDate = timestamp => {

  const date = new Date( timestamp.seconds * 1000 );
  return date.toLocaleString( "ru-RU" )
    .split( "," )[ 0 ];

};
export default { getFileName, timestampToDate };
