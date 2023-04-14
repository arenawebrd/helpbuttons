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
import { FetchUserData } from 'state/Users';

import { useRef } from 'store/Store';
import { GetConfig } from 'state/Setup';
import { alertService } from 'services/Alert';
import { SetupSteps } from '../shared/setupSteps';
import { SetupDtoOut } from 'shared/entities/setup.entity';

import { pathToRegexp } from 'path-to-regexp';
import { allowedPathsPerRole } from '../shared/pagesRoles';
import { Role } from 'shared/types/roles';
import { isRoleAllowed } from 'shared/sys.helper';
import { version } from 'shared/commit';

export default appWithTranslation(MyApp);

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);
  const [noBackend, setNobackend] = useState(false);

  const config = useRef(store, (state: GlobalState) => state.config);
  const path = router.asPath.split('?')[0];

  const loggedInUser = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
  );

  const selectedNetwork = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
  );

  const setupPaths: string[] = [
    SetupSteps.CREATE_ADMIN_FORM,
    SetupSteps.FIRST_OPEN,
    SetupSteps.NETWORK_CREATION,
    SetupSteps.SYSADMIN_CONFIG,
  ];

  useEffect(() => {
    if (setupPaths.includes(path)) {
      setIsSetup(true);
    }

    if (!config && SetupSteps.SYSADMIN_CONFIG.toString() != path) {
      store.emit(
        new GetConfig(
          (config) => {
            console.log(`got config`);
            if (
              !setupPaths.includes(path)
            ) {
              fetchDefaultNetwork(config);
            }
          },
          (error) => {
            if (error == 'not-found') {
              router.push(SetupSteps.SYSADMIN_CONFIG);
            } else {
              alertService.error(JSON.stringify(error));
            }

            return;
          },
        ),
      );
    }
    if (
      !authorized &&
      config &&
      config.userCount < 1 &&
      path == SetupSteps.CREATE_ADMIN_FORM
    ) {
      setAuthorized(true);
    }
    if (!authorized) {
      if (UserService.isLoggedIn()) {
        // check if local storage has a token
        if (!loggedInUser) {
          if (!isLoadingUser) {
            store.emit(
              new FetchUserData(
                () => {
                  setIsLoadingUser(false);
                },
                (error) => {
                  // if local storage has a token, and fails to fetchUserData then delete storage token
                  UserService.logout();
                  setIsLoadingUser(false);
                },
              ),
            );
          }
          setIsLoadingUser(true);
        } else {
          setAuthorized(isRoleAllowed(loggedInUser.role, path));
        }
      } else {
        if (config) {
          if (
            config.userCount < 1 &&
            path == SetupSteps.CREATE_ADMIN_FORM
          ) {
            setAuthorized(true);
          } else {
            setAuthorized(isRoleAllowed(Role.guest, path));
          }
        } else if (
          path != SetupSteps.CREATE_ADMIN_FORM &&
          path != SetupSteps.SYSADMIN_CONFIG
        ) {
          setAuthorized(isRoleAllowed(Role.guest, path));
        }
      }
    }

    function fetchDefaultNetwork(configuration) {
      if (configuration && !selectedNetwork && !isLoadingNetwork) {
        setIsLoadingNetwork(true);
        store.emit(
          new FetchDefaultNetwork(
            () => {
              console.log('all is ready!');
            },
            (error) => {
              if (error === 'network-not-found') {
                if (configuration.databaseNumberMigrations < 1) {
                  alertService.error(
                    `Missing database schema, please run schema creation/migrations! and then <a href="/">click here</a>`,
                  );
                  return;
                } else if (
                  configuration.userCount < 1 &&
                  SetupSteps.CREATE_ADMIN_FORM != path
                ) {
                  alertService.error(
                    `Need to create an admin account <a href="${SetupSteps.CREATE_ADMIN_FORM}">click here</a>`,
                  );
                  router.push(SetupSteps.CREATE_ADMIN_FORM);
                } else if (
                  loggedInUser &&
                  (SetupSteps.NETWORK_CREATION == path ||
                  SetupSteps.FIRST_OPEN == path)
                ) {
                  router.push({
                    pathname: '/Login',
                    query: { returnUrl: path },
                  });
                } else {
                  console.error('network not found')
                  console.error(error);
                  router.push({
                    pathname: SetupSteps.FIRST_OPEN,
                  });
                }
              }
            },
          ),
        );
      }
    }
  }, [path, config, loggedInUser]);

  return (
    <>
      <Head>
        <title>Helpbuttons.org</title>
        <meta name="commit" content={version.git} />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
      </Head>
      <div className={`${user ? '' : ''}`}>
        <Alert />
        {(() => {
          if (config && authorized && selectedNetwork) {
            return (
              <div>
                <Component {...pageProps} />
                <NavBottom logged={!!loggedInUser} />
              </div>
            );
          } else if (isSetup) {
            return (
              <div>
                <Component {...pageProps} />
              </div>
            );
          } else if (noBackend) {
            return <>NO BACKEND!!</>;
          }

          return <div>Loading...</div>;
        })()}
      </div>
    </>
  );
}
