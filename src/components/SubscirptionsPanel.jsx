/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-loops */
/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
/* This allows adding, removing and editing subscriptions.
   They are folders in the storage.
   The name of the folder is the name of the subscription. */
import {
  deleteObject,
  getBlob,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import React from "react";

const listFolders = async() => {

  const storage    = getStorage();
  const reference  = ref( storage );
  const listResult = await listAll( reference );
  return listResult.prefixes.map( folder =>
    folder.name );

};

const renameFolder = async(
  /** @type {string} */ folderName,
  /** @type {string} */ newName
) => {

  // move each of the files in the folder to the same path but with the new name since folders are created dynamically
  const storage    = getStorage();
  const folder     = ref(
    storage,
    folderName
  );
  const listResult = await listAll( folder );
  listResult.items.map( fileReference => {

    const newFileReference = ref(
      storage,
      `${ newName }/${ fileReference.name }`
    );
    moveFile(
      fileReference,
      newFileReference
    );

  } );

};

const moveFile = async(
  /** @type {import("@firebase/storage").StorageReference} */ fileReference,
  /** @type {import("@firebase/storage").StorageReference} */ newFileReference
) => {

  try {

    // first download the file with getBlob
    const blob = await getBlob( fileReference );

    // then upload it to the new location
    await uploadBytes(
      newFileReference,
      blob
    );

    // then delete the original file
    await deleteObject( fileReference );

  } catch ( error ) {

    console.error( error );

  }

};

const SubscriptionsPanel = () => {

  const [
    subscriptions,
    setSubscriptions,
  ] = React.useState( [] );
  const refreshSubscriptions = React.useCallback(
    async() => {

      await listFolders()
        .then( setSubscriptions );

    },
    []
  );
  React.useEffect(
    () => {

      const data = refreshSubscriptions();

    },
    [ refreshSubscriptions ]
  );

  return (
    <>
      <ul>
        { subscriptions.map( ( /** @type {string} */ subscription ) =>
          (
            <li key={ subscription }>
              { subscription }
            </li>
          ) ) }
      </ul>
      <button
        onClick={ () => {

          renameFolder(
            "A",
            "test"
          );
          refreshSubscriptions();

        } } >
        Rename A to test
      </button>
      <button
        onClick={ () => {

          renameFolder(
            "test",
            "A"
          );
          refreshSubscriptions();

        } } >
        Rename test to A
      </button>

    </>
  );

};

export default SubscriptionsPanel;
