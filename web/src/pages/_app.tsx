import type { AppProps } from 'next/app';
import '../styles/app.scss';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBottom from 'components/nav/NavBottom'; //just for mobile
import Alert from 'components/overlay/Alert';
import { httpService } from 'services/HttpService';
import { UserService } from 'services/Users';
import { appWithTranslation } from 'next-i18next';
import { GlobalState, store } from 'pages';
import { FetchDefaultNetwork } from 'state/Networks';
import { FetchUserData, SetCurrentUser } from 'state/Users';

import { useRef } from 'store/Store';
import SysadminConfig from './SysadminConfig';
import { GetConfig } from 'state/Setup';
import { NavigateTo } from 'state/Routes';

export default appWithTranslation(MyApp);

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  const config = useRef(store, (state: GlobalState) => state.config);
  const path = router.asPath.split('?')[0];

  const currentUser = useRef(
    store,
    (state: GlobalState) => state.users.currentUser,
  );

  // Whenever we log in or log out, fetch user data
  httpService.isAuthenticated$.subscribe((isAuthenticated) => {
    if (isAuthenticated && !currentUser) {
      store.emit(
        new FetchUserData(
          () => {},
          (err) => {
            UserService.logout();
          },
        ),
      );
    } else if (!isAuthenticated && currentUser) {
      store.emit(new SetCurrentUser(undefined));
    }
  });

  useEffect(() => {
    // if (config) {
    // on route change start - hide page content by setting authorized to false
    // load the default network and make it available globally
    const setupPaths = [
      '/Setup/CreateAdmin',
      '/Setup/FirstOpen',
      '/Setup/InstanceCreation',
      '/Setup/SysadminConfig',
    ];

    if (!setupPaths.includes(path))
    {
      store.emit(new FetchDefaultNetwork(() => {
        authCheck();
      }, 
      () => {
        router.push({
          pathname: '/Setup/SysadminConfig',
        });
      }));
    }else {
      setIsSetup(true);
    }
    
  }, [path]);

  function authCheck() {
    // redirect to login page if accessing a private page and not logged in
    const publicPaths = [
      '/Login',
      '/Signup',
      '/RepositoryPage',
      '/Faqs',
      '/',
      '/ButtonNew',
      '/Explore',
      '/HomeInfo',
      '/ButtonFile/[id]',
    ];

    const path = router.asPath.split('?')[0];

    if (!UserService.isLoggedIn() && !publicPaths.includes(path)) {
      // and is not 404
      if (path != '/Login') {
        router
          .push({
            pathname: '/Login',
            query: { returnUrl: router.asPath },
          })
          .catch((err) => {
            // console.log(err)
          });
      }
    } else {
      setAuthorized(true);
    }
  }

  return (
    <>
      <Head>
        <title>Helpbuttons.org</title>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
      </Head>
      <div className={`${user ? '' : ''}`}>
        {authorized && 
        <div>
          <Component {...pageProps} />
          <Alert />
          <NavBottom logged={!!currentUser} />
        </div>
        }
        {isSetup &&
          <div>
            <Component {...pageProps} />
            <Alert />
          </div>
        }
      </div>
    </>
  );
}
