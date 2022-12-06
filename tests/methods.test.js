/* eslint-disable fp/no-unused-expression, fp/no-nil */
/**
 * @vitest-environment jsdom
 */
import {
  describe, expect, test, vi,
} from "vitest";

import methods from "../src/methods";

const mockAddObjectToDatabase =  vi.fn( object => {

  const document = getDoc( reference );
  const merged   = { subs: {
    ...document.exists()
      ? document.data().subs
      : {},
    ...object,
  } };

  return { type: object };

} );

describe(
  "getFileName",
  () => {

    const { getFileName } = methods;
    const testCases       = [
      [
        "https://firebasestorage.googleapis.com/v0/b/....com/o/C%2FGeisha%20Oen%20with%20a%20fan.jpg?alt=media&token",
        "Geisha Oen with a fan.jpg",
      ],
      [
        "https://firebasestorage.googleapis.com/v0/b/....com/o/A%2FYarn%20Brocade.jpg?alt=media&token=",
        "Yarn Brocade.jpg",
      ],
    ];

    testCases.map( ( [
      url,
      expected,
    ] ) => {

      test(
        `getFileName( ${ url } )`,
        () => {

          expect( getFileName( url ) )
            .toBe( expected );

        }
      );

    } );

  }
);

describe(
  "timestampToDate",
  () => {

    const { timestampToDate } = methods;
    const testCases           = [ [
      {
        nanoseconds: 0,
        seconds    : 1_675_327_778,
      },
      "02.02.2023",
    ] ];
    testCases.map( ( [
      timestamp,
      expected,
    ] ) => {

      test(
        `timestampToDate(${ timestamp.seconds })`,
        () => {

          expect( timestampToDate( timestamp ) )
            .toBe( expected );

        }
      );

    } );

  }
);

describe(
  "stringifyRequestDocument",
  () => {

    const { stringifyRequestDocument } = methods;
    const testCases                    = [ [
      {
        A: 4,
        B: 5,
      },
      [
        "A на 4 мес.",
        "B на 5 мес.",
      ],
    ] ];
    testCases.map( ( [
      object,
      expected,
    ] ) => {

      test(
        `stringifyRequestDocument(${ object })`,
        () => {

          expect( stringifyRequestDocument( object ) )
            .toStrictEqual( expected );

        }
      );

    } );

  }
);
