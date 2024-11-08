import React, { useEffect, useState } from "react";
import { createSelector } from "reselect";
import { Button, Form, Input, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
// hooks
import { useRedux } from "../../../hooks/index";

// actions
import {
  inviteContact,
  resetContacts,
  getFavourites,
  getDirectMessages,
  getChannels,
  addContacts,
  createChannel,
  changeSelectedChat,
  getChatUserDetails,
  getChatUserConversations,
  getChannelDetails,
  getArchiveContact,
  readConversation,
} from "../../../redux/actions";

// interfaces
import { CreateChannelPostData } from "../../../redux/actions";

// components
import AppSimpleBar from "../../../components/AppSimpleBar";
import AddGroupModal from "../../../components/AddGroupModal";
import InviteContactModal from "../../../components/InviteContactModal";
import AddButton from "../../../components/AddButton";
import ContactModal from "../../../components/ContactModal";

import Favourites from "./Favourites";
import DirectMessages from "./DirectMessages";
import Chanels from "./Chanels";
import Archive from "./Archive";
import { CHATS_TABS } from "../../../constants";

interface IndexProps {}
const Index = (props: IndexProps) => {
  // global store
  const { dispatch, useAppSelector } = useRedux();

  const errorData = createSelector(
    (state : any) => state.Contacts,
    (props : any) => props.Chats,
    (state,props) => ({
      isContactInvited: state.isContactInvited,
        favourites: props.favourites,
        directMessages: props.directMessages,
        channels: props.channels,
        isContactsAdded: props.isContactsAdded,
        isChannelCreated: props.isChannelCreated,
        selectedChat: props.selectedChat,
        isFavouriteContactToggled: props.isFavouriteContactToggled,
        archiveContacts: props.archiveContacts,
        isContactArchiveToggled: props.isContactArchiveToggled,
        chatUserDetails:props.chatUserDetails,
    })
  );

  // Inside your component
  const {isContactInvited, favourites, directMessages, channels, isContactsAdded, isChannelCreated, selectedChat, isFavouriteContactToggled,
    archiveContacts, isContactArchiveToggled, chatUserDetails} = useAppSelector(errorData);
  
  // get data

  useEffect(() => {
    dispatch(getFavourites());
    dispatch(getDirectMessages());
    dispatch(getChannels());
  }, [dispatch]);
  useEffect(() => {
    if (isFavouriteContactToggled) {
      dispatch(getFavourites());
      dispatch(getDirectMessages());
    }
  }, [dispatch, isFavouriteContactToggled]);

  /*
  invite contact modal handeling
  */
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  /*
  onInvite handeling
  */
  const onInviteContact = (data: any) => {
    dispatch(inviteContact(data));
  };
  useEffect(() => {
    if (isContactInvited) {
      setIsOpen(false);
      setTimeout(() => {
        dispatch(resetContacts("isContactInvited", false));
      }, 1000);
    }
  }, [dispatch, isContactInvited]);

  /*
  contact add handeling
  */
  const [isOpenAddContact, setIsOpenAddContact] = useState<boolean>(false);
  const openAddContactModal = () => {
    setIsOpenAddContact(true);
  };
  const closeAddContactModal = () => {
    setIsOpenAddContact(false);
  };
  const onAddContact = (contacts: Array<string | number>) => {
    dispatch(addContacts(contacts));
  };
  useEffect(() => {
    if (isContactsAdded) {
      setIsOpenAddContact(false);
      dispatch(getDirectMessages());
    }
  }, [dispatch, isContactsAdded]);

  /*
  channel creation handeling
  */
  const [isOpenCreateChannel, setIsOpenCreateChannel] =
    useState<boolean>(false);
  const openCreateChannelModal = () => {
    setIsOpenCreateChannel(true);
  };
  const closeCreateChannelModal = () => {
    setIsOpenCreateChannel(false);
  };
  const onCreateChannel = (channelData: CreateChannelPostData) => {
    dispatch(createChannel(channelData));
  };
  useEffect(() => {
    if (isChannelCreated) {
      setIsOpenCreateChannel(false);
      dispatch(getChannels());
    }
  }, [dispatch, isChannelCreated]);

  /*
  select chat handeling :
    get conversations
    get chat user details
  */

  const onSelectChat = (id: string | number, isChannel?: boolean) => {
    if (isChannel) {
      dispatch(getChannelDetails(id));
    } else {
      dispatch(getChatUserDetails(id));
    }
    dispatch(readConversation(id));
    dispatch(getChatUserConversations(id));
    dispatch(changeSelectedChat(id));
  };

  /*
  tab handeling
  */
  const [active, setActive] = useState(CHATS_TABS.DEFAULT);
  const onChangeTab = (tab: CHATS_TABS) => {
    setActive(tab);
  };

  /*
  archive contacts
  */
  useEffect(() => {
    dispatch(getArchiveContact());
  }, [dispatch]);
  useEffect(() => {
    if (isContactArchiveToggled) {
      dispatch(getArchiveContact());
      dispatch(getFavourites());
      dispatch(getDirectMessages());
      dispatch(getChannels());
      dispatch(getChatUserDetails(chatUserDetails.id));
    }
  }, [dispatch, isContactArchiveToggled, chatUserDetails.id]);

  //serach recent user
  const searchUsers = () => {
    var li, a, i, txtValue: any;
    const inputValue: any = document.getElementById("serachChatUser");
    const filter: any = inputValue.value.toUpperCase();
    const ul: any = document.querySelector(".chat-room-list");
      li = ul.getElementsByTagName("li");
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
  };

  return (
    <>
      <div>
        <div className="px-4 pt-4">
          <div className="d-flex align-items-start">
            <div className="flex-grow-1">
              <h4 className="mb-4">Chats</h4>
            </div>
            <div className="flex-shrink-0">
              <div id="add-contact">
                {/* Button trigger modal */}
                <AddButton onClick={openModal} />
              </div>
              <UncontrolledTooltip target="add-contact" placement="bottom">
                Add Contact
              </UncontrolledTooltip>
            </div>
          </div>
          <Form>
            <div className="input-group mb-3">
              <Input
                onKeyUp={searchUsers}
                id="serachChatUser"
                type="text"
                className="form-control bg-light border-0 pe-0"
                placeholder="Search here.."
              />
              <Button color="light" type="button" id="searchbtn-addon">
                <i className="bx bx-search align-middle"></i>
              </Button>
            </div>
          </Form>
        </div>{" "}
        {/* .p-4 */}
        <AppSimpleBar className="chat-room-list">
          {/* Start chat-message-list */}
          {active === CHATS_TABS.DEFAULT && (
            <>
              {/* favourite */}
              <Favourites
                users={favourites}
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
              />

              {/* direct messages */}
              <DirectMessages
                users={directMessages}
                openAddContact={openAddContactModal}
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
              />

              {/* channels list */}
              <Chanels
                channels={channels}
                openCreateChannel={openCreateChannelModal}
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
              />
              <h5 className="text-center mb-2">
                <Link
                  to="#"
                  className="mb-3 px-4 mt-4 font-size-11 text-primary"
                  onClick={() => onChangeTab(CHATS_TABS.ARCHIVE)}
                >
                  Archived Contacts{" "}
                  <i className="bx bxs-archive-in align-middle" />
                </Link>
              </h5>
            </>
          )}
          {active === CHATS_TABS.ARCHIVE && (
            <>
              <Archive
                archiveContacts={archiveContacts}
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
              />
              <h5 className="text-center mb-2">
                <Link
                  to="#"
                  className="mb-3 px-4 mt-4 font-size-11 text-primary"
                  onClick={() => onChangeTab(CHATS_TABS.DEFAULT)}
                >
                  Chats <i className="bx bxs-archive-out align-middle" />
                </Link>
              </h5>
            </>
          )}

          {/* End chat-message-list */}
        </AppSimpleBar>
      </div>
      {/* add group Modal */}
      {isOpenCreateChannel && (
        <AddGroupModal
          isOpen={isOpenCreateChannel}
          onClose={closeCreateChannelModal}
          onCreateChannel={onCreateChannel}
        />
      )}

      {/* add contact modal */}
      {isOpen && (
        <InviteContactModal
          isOpen={isOpen}
          onClose={closeModal}
          onInvite={onInviteContact}
        />
      )}

      {isOpenAddContact && (
        <ContactModal
          isOpen={isOpenAddContact}
          onClose={closeAddContactModal}
          onAddContact={onAddContact}
        />
      )}
    </>
  );
};

export default Index;
