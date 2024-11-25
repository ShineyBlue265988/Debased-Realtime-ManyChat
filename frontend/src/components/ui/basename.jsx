import React from 'react';
import { Avatar, Identity, Name, useName } from '@coinbase/onchainkit/identity';
// import {
//   ConnectWallet,
//   Wallet,
//   WalletDropdown,
//   WalletDropdownBasename, 
//   WalletDropdownDisconnect,
// } from '@coinbase/onchainkit/wallet';
import { baseSepolia, base } from 'viem/chains';
import { FaAddressBook } from 'react-icons/fa';
const BasenameDisplay = ({ address }) => {
  const address1="0x3ADCD1F205b7eAe71Fec5856024D8e71fC7af9E6"
  return (
    <Identity
      address={address}
      chain={base}
      schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
    >
      
        {/* <Avatar address={address} chain={base} className="w-5 h-5 ml-6 mr-2 " fallback={<img src={defaultAvatar} alt="Default Avatar" className="w-5 h-5 ml-6 mr-2 "/>}/> */}
        <Name address={address} chain={base} />
      {/* <Address /> */}
    </Identity>
  );
};

export default BasenameDisplay;