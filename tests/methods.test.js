/* eslint-disable fp/no-unused-expression, fp/no-nil */
/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from "vitest";

import methods from "../src/methods";

describe( "getFileName", () => {

  const { getFileName } = methods;
  const testCases       = [
    [ "https://firebasestorage.googleapis.com/v0/b/....com/o/C%2FGeisha%20Oen%20with%20a%20fan.jpg?alt=media&token", "Geisha Oen with a fan.jpg" ],
    [ "https://firebasestorage.googleapis.com/v0/b/....com/o/A%2FYarn%20Brocade.jpg?alt=media&token=", "Yarn Brocade.jpg" ],
  ];

  // eslint-disable-next-line jest/require-hook
  testCases.map( ( [ url, expected ] ) => {

    test( `getFileName( ${ url } )`, () => {

      expect( getFileName( url ) )
        .toBe( expected );

    } );

  } );

} );

describe( "timestampToDate", () => {

  const { timestampToDate } = methods;
  const testCases           = [
    [
      {
        nanoseconds: 0,
        seconds    : 1_675_327_778,
      },
      "02.02.2023",
    ],
  ];
  // eslint-disable-next-line jest/require-hook
  testCases.map( ( [ timestamp, expected ] ) => {

    test( `timestampToDate(${ timestamp.seconds })`, () => {

      expect( timestampToDate( timestamp ) )
        .toBe( expected );

    } );

  } );

} );
