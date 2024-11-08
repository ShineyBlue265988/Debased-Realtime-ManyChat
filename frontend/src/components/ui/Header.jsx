import { Link, useNavigate } from 'react-router-dom';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi'; // Import menu icons
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, logout, fetchUserName, getSubscriptionState } from '../../store/authSlice';
import debased from '../icons/debased.png';

const Header = () => {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, username, isSubscribed } = useSelector(state => state.auth);
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'ChatRoom', path: '/chat' },
    { label: 'Pricing', path: '/subscription' },
  ];
  useEffect(() => {
    if (primaryWallet) {
      dispatch(setAuth(primaryWallet.address));
      dispatch(fetchUserName(primaryWallet));
      dispatch(getSubscriptionState(primaryWallet));
    }
  }, [primaryWallet, dispatch]);
  const getEnsName = async () => {
    const publicClient = await primaryWallet?.getPublicClient()

    // Now you can use the public client to read data from the blockchain
    const ens = await publicClient?.getEnsName({ address: primaryWallet.address })
    return ens
  }
  // useEffect(() => {
  //   if (primaryWallet) {
  //     const address = primaryWallet?.address
  //     const ensName = getEnsName()
  //     console.log('ensName', ensName)
  //     if (ensName) {
  //       setUsername(ensName)
  //     }
  //     else {
  //       setUsername(address?.slice(0, 7));
  //     }
  //   }
  // }, [primaryWallet]);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle menu on click
  const handleLogOutClick = () => {
    handleLogOut();
    dispatch(logout());
  };
  // console.log('primaryWallet', primaryWallet);
  return (
    <header className="bg-white shadow-md w-full border-b-4 border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img
              src={debased}
              alt="Logo"
              width={40}
              height={40}
              onClick={() => navigate('/')}
              className="hover:scale-105 cursor-pointer"
            />

            <div className="md:hidden">
              <button onClick={toggleMenu} aria-label="Toggle menu">
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>

            <nav className="hidden md:flex gap-6">
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
            <DynamicWidget />
            {isAuthenticated && (
              <>
                <span className="text-gray-600">{username}</span>
                <button
                  onClick={handleLogOutClick}
                  className="text-red-600 hover:text-red-700 hidden md:block"
                >
                  Log Out
                </button>
              </>
            )}
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
            {isAuthenticated && (
              <button
                onClick={handleLogOutClick}
                className="text-red-600 hover:text-red-700"
              >
                Log Out
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;