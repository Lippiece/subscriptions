/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-loops */
/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */

/* This allows adding, removing and editing subscriptions.
   They are folders in the storage.
   The name of the folder is the name of the subscription. */
import "../css/SubscriptionsPanel.css";

import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  createTheme, ThemeProvider,
} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getBlob,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import React from "react";

const darkTheme   = createTheme( { palette: { mode: "dark" } } );
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
const renameDocument = async(
  /** @type {string} */ collection,
  /** @type {string} */ document,
  /** @type {string} */ newName
) => {

  const database             = getFirestore();
  const documentReference    = doc(
    database,
    collection,
    document
  );
  const documentSnap         = await getDoc( documentReference );
  const data                 = documentSnap.data();
  const newDocumentReference = doc(
    database,
    collection,
    newName
  );
  try {

    await setDoc(
      newDocumentReference,
      data
    );
    await deleteDoc( documentReference );

  } catch ( error ) {

    console.error( error );

  }

};

// for all the documents in the "subscriptions" collection, go to subscriptions/userName/subs and rename the oldName key in the userName document to newName using map: subscriptions/userName/subs/oldName -> subscriptions/userName/subs/newName
const renameSubscriptionAtUsers = async(
  /** @type {string} */ oldName,
  /** @type {string} */ newName
) => {

  const database            = getFirestore();
  const collectionReference = collection(
    database,
    "subscriptions"
  );
  const collectionSnapshot  = await getDocs( collectionReference );
  const collectionResults   = collectionSnapshot.docs.map( document_ =>
    document_.id );
  collectionResults.map( async userName => {

    const userReference = doc(
      database,
      "subscriptions",
      userName
    );
    const userSnapshot  = await getDoc( userReference );
    const userData      = userSnapshot.data();
    if ( userData.subs[ oldName ] ) {

      userData.subs[ newName ] = userData.subs[ oldName ];
      delete userData.subs[ oldName ];
      await setDoc(
        userReference,
        userData
      );

    }

  } );

};
const renameSubscriptionsRequests = async(
  /** @type {string} */ oldName,
  /** @type {string} */ newName
) => {

  const database            = getFirestore();
  const collectionReference = collection(
    database,
    "requests"
  );
  const collectionSnapshot  = await getDocs( collectionReference );
  const collectionResults   = collectionSnapshot.docs.map( document_ =>
    document_.id );
  collectionResults.map( async userName => {

    const userReference = doc(
      database,
      "requests",
      userName
    );
    const userSnapshot  = await getDoc( userReference );
    const userData      = userSnapshot.data();
    if ( userData[ oldName ] ) {

      userData[ newName ] = userData[ oldName ];
      delete userData[ oldName ];

      await setDoc(
        userReference,
        userData
      );

    }

  } );

};
const SubscriptionsPanel = ( {
  refreshGlobalSubscriptions,
  refreshRequests,
} ) => {

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
    <div
      className={"subscriptions-panel"}>
      <h1>
        Подписки
      </h1>
      <List>
        { subscriptions.map( subscription =>
          (
            <SubscriptionItem
              key                        = { subscription }
              refreshGlobalSubscriptions = { refreshGlobalSubscriptions }
              refreshRequests            = { refreshRequests }
              subscription               = { subscription }
            />
          ) ) }
      </List>
    </div>

  );

};
const SubscriptionItem = ( {
  /** @type {string} */ subscription,
  refreshGlobalSubscriptions,
  refreshRequests,
} ) => {

  const [
    lengths,
    setLengths,
  ] = React.useState( /** @type {number[]} */ [] );
  const [
    newName,
    setNewName,
  ] = React.useState( /** @type {string} */ "" );
  const [
    newLengths,
    setNewLengths,
  ] = React.useState( /** @type {number[]} */ [] );
  const [
    status,
    setStatus,
  ] = React.useState( /** @type {string} */ "initial" );
  const [
    anchorElement,
    setAnchorElement,
  ] = React.useState( /** @type {HTMLElement} */ null );
  const [
    lengthsDialogOpen,
    setLengthsDialog,
  ] = React.useState( /** @type {boolean} */ false );
  const [
    priceDialogOpen,
    setPriceDialog,
  ] = React.useState( /** @type {boolean} */ false );
  const [
    price,
    setPrice,
  ] = React.useState( /** @type {number} */ 0 );
  const [
    newPrice,
    setNewPrice,
  ] = React.useState( /** @type {number} */ 0 );
  const [
    info,
    setInfo,
  ] = React.useState( /** @type {string} */ "" );
  const refreshLengths = React.useCallback(
    async() => {

      const database          = getFirestore();
      const documentReference = doc(
        database,
        "types",
        subscription
      );
      const documentSnap      = await getDoc( documentReference );
      const data              = documentSnap.data();
      setLengths( data.lengths );
      setNewLengths( data.lengths );

    },
    [ subscription ]
  );
  React.useEffect(
    () => {

      const data = refreshLengths();

    },
    [ refreshLengths ]
  );
  const refreshPrice = React.useCallback(
    async() => {

      const database          = getFirestore();
      const documentReference = doc(
        database,
        "types",
        subscription
      );
      const documentSnap      = await getDoc( documentReference );
      const data              = documentSnap.data();
      setPrice( data.price );
      setNewPrice( data.price );

    },
    [ subscription ]
  );
  React.useEffect(
    () => {

      const data = refreshPrice();

    },
    [ refreshPrice ]
  );
  const dropDownOpen       = Boolean( anchorElement );
  const renameSubscription = async() => {

    setNewName( "" );
    setStatus( "working" );

    setInfo( "Переименование папки с файлами подписки" );
    await renameFolder(
      subscription,
      newName
    );
    setInfo( "Переименование документа подписки" );
    await renameDocument(
      "types",
      subscription,
      newName
    );
    setInfo( "Переименование подписок пользователей" );
    await renameSubscriptionAtUsers(
      subscription,
      newName
    );
    setInfo( "Переименование подписок в запросах" );
    await renameSubscriptionsRequests(
      subscription,
      newName
    );
    await new Promise( resolve =>
      setTimeout(
        resolve,
        2000
      ) );
    setInfo( "" );

    setStatus( "initial" );
    refreshGlobalSubscriptions();
    refreshRequests();

  };

  // TODO: go to firestore/types/subscriptionName and replace the lengths array
  const changeLenghts = async() => {

    const database          = getFirestore();
    const documentReference = doc(
      database,
      "types",
      subscription
    );
    await updateDoc(
      documentReference,
      { lengths: newLengths }
    );
    await refreshLengths();

  };
  const changePrice = async() => {

    const database          = getFirestore();
    const documentReference = doc(
      database,
      "types",
      subscription
    );
    await updateDoc(
      documentReference,
      { price: newPrice }
    );
    await refreshPrice();

  };
  const handleDropdown        = ( /** @type {{ currentTarget: React.SetStateAction<null>; }} */ event ) => {

    setAnchorElement( event.currentTarget );

  };
  const handleDropdownClose   = () => {

    setAnchorElement( null );

  };
  const lengthInputProperties = {
    min : 1,
    step: 1,
    type: "number",
  };
  return (
    <ThemeProvider
      theme={ darkTheme }>
      <List
        className={ "subscription-item" }>
        <h1
          hidden={ info === "" }
        >
          { info }
        </h1>
        <ListItem>
          <CircularProgress
            color={ "primary" }
            hidden={ status !== "working" }
          />
          <TextField
            color = { "primary" }
            hidden={ status !== "editingName" }
            label = { subscription }
            onChange={ event =>
              setNewName( event.target.value ) }
            size  = { "small" }
            value={ newName }
          />
          <ListItemButton
            hidden={ newName === "" }
            onClick={ () =>
              renameSubscription(
                subscription,
                newName
              ) }
          >
            <CheckIcon />
          </ListItemButton>
          <ListItemButton
            hidden={ status !== "editingName" }
            onClick={ () =>
              setStatus( "initial" )}

          >
            <CloseIcon />
          </ListItemButton>
          <h1
            className={ "subscription-item-name" }
            hidden={ status === "editingName" }
          >
            { subscription }
          </h1>
          <ListItemText
            hidden={ status === "editingName" }
            primary={ `${ price } руб./мес.` }
            secondary={ `Сроки: ${ lengths.join( ", " ) }` }
          />
          <ListItemButton
            aria-controls={ "unroll-subscription-menu" }
            aria-expanded={ dropDownOpen && "true"}
            aria-haspopup={ "true" }
            id={ "unroll-subscription" }

            onClick={ handleDropdown }
          >
            <ArrowDropDownIcon />
          </ListItemButton>
          <Menu
            anchorEl={ anchorElement }
            id={ "unroll-subscription-menu" }
            onClose={ handleDropdownClose }
            open={ dropDownOpen }
          >
            <MenuItem
              onClick={ () => {

                handleDropdownClose();
                setStatus( "editingName" );

              } }
            >
              Переименовать
            </MenuItem>
            <MenuItem
              onClick={ () =>
                setLengthsDialog( !lengthsDialogOpen ) }
            >
              Редактировать сроки
            </MenuItem>
            <Dialog
              onClose={ () =>
                setLengthsDialog( !lengthsDialogOpen ) }
              open={ lengthsDialogOpen }
            >
              <DialogTitle>
                Введите новые сроки
              </DialogTitle>
              <DialogContent>
                <List>
                  { newLengths.map( (
                    length, index
                  ) =>
                    ( <ListItem
                      key={ index }
                    >
                      <TextField
                        color={ "primary" }
                        inputProps={ lengthInputProperties }
                        label={ "Срок" }
                        onChange={ event =>
                          setNewLengths( [
                            ...newLengths.slice(
                              0,
                              index
                            ),
                            event.target.value,
                            ...newLengths.slice( index + 1 ),
                          ] ) }
                        size={ "small" }
                        value={ length }
                      />
                      <ListItemButton
                        onClick={ () =>
                          setNewLengths( [
                            ...newLengths.slice(
                              0,
                              index
                            ),
                            ...newLengths.slice( index + 1 ),
                          ] ) }
                      >
                        <CloseIcon />
                      </ListItemButton>
                      </ListItem> ) ) }
                </List>
                <ListItemButton
                  onClick={ () =>
                    setNewLengths( [
                      ...newLengths,
                      "",
                    ] ) }
                >
                  <AddIcon />
                </ListItemButton>
              </DialogContent>
              <DialogActions>
                <Button
                  color={ "primary" }
                  onClick={ async() => {

                    setStatus( "working" );
                    await changeLenghts();
                    setStatus( "initial" );
                    setLengthsDialog( !lengthsDialogOpen );

                  } }
                >
                  Принять
                </Button>
                <CircularProgress
                  color={ "primary" }
                  hidden={ status !== "working" }
                />
                <Button
                  color={ "primary" }
                  onClick={ () =>
                    setLengthsDialog( !lengthsDialogOpen ) }
                >
                  Отмена
                </Button>
              </DialogActions>
            </Dialog>
            <MenuItem
              onClick={ () =>
                setPriceDialog( !priceDialogOpen ) }
            >
              Редактировать цену
            </MenuItem>
            <Dialog
              onClose={ () =>
                setPriceDialog( !priceDialogOpen ) }
              open={ priceDialogOpen }
            >
              <DialogTitle>
                Введите новую цену
              </DialogTitle>
              <DialogContent>
                <TextField
                  onChange={ event =>
                    setNewPrice( event.target.value ) }
                  size={ "small" }
                  value={ newPrice }
                />
              </DialogContent>
              <DialogActions>
                <Button
                  color={ "primary" }
                  onClick={ async() => {

                    setStatus( "working" );
                    await changePrice();
                    setStatus( "initial" );
                    setPriceDialog( !priceDialogOpen );

                  }}
                >
                  Принять
                </Button>
                <CircularProgress
                  color={ "primary" }
                  hidden={ status !== "working" }
                />
                <Button
                  color={ "primary" }
                  onClick={ () =>
                    setPriceDialog( !priceDialogOpen )}
                >
                  Отмена
                </Button>
              </DialogActions>
            </Dialog>
          </Menu>
        </ListItem>
      </List>
    </ThemeProvider>
  );

};
export default SubscriptionsPanel;
