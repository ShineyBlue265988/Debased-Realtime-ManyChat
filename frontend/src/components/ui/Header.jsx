import { Link, useNavigate } from 'react-router-dom';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, logout, fetchUserName, getSubscriptionState, fetchPublicKey } from '../../store/authSlice';
import { Avatar } from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Name, Badge, Identity } from "@coinbase/onchainkit/identity";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from "wagmi";
const Header = () => {
  // const { primaryWallet, handleLogOut } = useDynamicContext();
  // console.log("Primary Wallet:", primaryWallet);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { primaryWallet, handleLogOut, } = useDynamicContext();
  const { isAuthenticated, username } = useSelector(state => state.auth);

  // Navigation items
  const navItems = [
    { label: 'Profile', path: '/profile' },
    { label: 'ChatRoom', path: '/chat' },
    { label: 'Pricing', path: '/subscription' },
  ];
  let { address } = useAccount();
  const account = useAccount();
  // console.log("Account: ", account);
  // console.log("Address: ", address);
  // Effect to handle wallet connection
  // console.log("primaryWallet: ", primaryWallet);
  useEffect(() => {
    if (primaryWallet) {
      dispatch(setAuth(primaryWallet));
      dispatch(fetchUserName(primaryWallet));
      dispatch(fetchPublicKey(primaryWallet));
      dispatch(getSubscriptionState(primaryWallet));
      // address=primaryWallet.address;
    }
  }, [primaryWallet, dispatch]);
  const subscriptionEndDate = useSelector(state => state.auth.subscriptionEndDate);
  const isSubscribed = useSelector(state => state.auth.isSubscribed);
  // console.log("subscriptionEndDate: ", subscriptionEndDate);
  // console.log("isSubscribed: ", isSubscribed);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle menu on click

  const handleLogOutClick = () => {
    // clearWalletConnectorPersistence();
    handleLogOut(); // Log out from Dynamic context
    localStorage.clear();
    sessionStorage.clear();
    dispatch(logout()); // Clear Redux state
    navigate('/'); // Redirect to home after logout
  };


  return (
    <header className="bg-white shadow-md w-full border-b-4 border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <img
              src={debased}
              alt="Logo"
              width={40}
              height={40}
              onClick={() => navigate('/')}
              className="hover:scale-105 cursor-pointer"
            /> */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isMenuOpen}>
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
            <div className='text-2xl font-bold text-blue-600 cursor-pointer hover:scale-105' onClick={() => navigate('/')} id='debase'>
              deBase
            </div>


            <nav className="hidden md:flex gap-6 ">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex justify-end ">
              {/* {!address&&<ConnectButton/>} */}
              {!address && <DynamicWidget innerButtonComponent={<button>Connect Wallet</button>}/>}
              {address && <Wallet >
                <ConnectWallet className='rounded-full  border-gray-200 flex items-center gap-2'>
                  <Avatar className="h-6 w-6 " />
                  <Name className='text-black '/>
                </ConnectWallet>
                <WalletDropdown >
                  <Identity
                    className="px-4 pt-3 pb-2"
                    hasCopyAddressOnClick
                    schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                    address={address}
                  >
                    <Avatar />
                    <Name>
                      {/* <Badge /> */}
                    </Name>
                    <Address />
                  </Identity>
                  <WalletDropdownBasename />
                  <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
                    Go to Wallet Dashboard
                  </WalletDropdownLink>
                  <div onClick={handleLogOutClick}>
                    <WalletDropdownDisconnect />
                  </div>
                </WalletDropdown>
              </Wallet>}
              {/* {address && (
                <>

                  <button
                    onClick={handleLogOutClick}
                    className="text-red-600 hover:text-red-700 hidden md:block"
                  >
                    Log Out
                  </button>
                </>
              )} */}
            </div>

          </div>
        </div>

        {isMenuOpen && (
          <nav className="flex flex-col mt-4 md:hidden gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

          </nav>
        )}
        {/* {isAuthenticated && (
          <button
            onClick={handleLogOutClick}
            className="text-red-600 hover:text-red-700"
          >
            Log Out
          </button>
        )} */}
      </div>
    </header>
  );
};

export default Header;