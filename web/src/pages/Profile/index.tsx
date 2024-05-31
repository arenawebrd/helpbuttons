//Users buttons an profile info URL
import CardProfile from 'components/user/CardProfile';

import { useRef } from 'store/Store';
import { GlobalState, store } from 'pages';
import router, { useRouter } from 'next/router';
import { Logout } from 'state/Users';
import Link from 'next/link';
import {
  IoAlarm,
  IoBuildOutline,
  IoCreateOutline,
  IoHammerOutline,
  IoHandLeftOutline,
  IoLogOutOutline,
  IoPersonAddOutline,
} from 'react-icons/io5';
import Btn, { IconType } from 'elements/Btn';
import { UserService } from 'services/Users';
import { Role } from 'shared/types/roles';
import t from 'i18n';
import { LoadabledComponent } from 'components/loading';
import Popup from 'components/popup/Popup';
import { getLocale } from 'shared/sys.helper';
import { Network } from 'shared/entities/network.entity';
import Accordion from 'elements/Accordion';

export default function Profile() {
  const loggedInUser = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
  );

  const { asPath } = useRouter();
  const selectedNetwork: Network = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
  );
  function logout() {
    UserService.logout();
    if (getLocale() != selectedNetwork.locale) {
      router.push({ pathname: '/HomeInfo'}, asPath, {
        locale: selectedNetwork.locale,
      });
    }
  }

  const removeProfile = () => {
    console.log('remove myself!');
  };

  const isAdmin = loggedInUser?.role == Role.admin;

  return (
    <>
          <Popup linkFwd="/Explore" title={t('user.profileView')}>
            <LoadabledComponent loading={!loggedInUser}>
              <CardProfile user={loggedInUser} />
              {(loggedInUser && !loggedInUser.phone && loggedInUser?.role == Role.admin) && 
               <span style={{"color": "red"}}>{t('user.addSupport')}</span>
              }
              <Accordion title={t('configuration.config')}>
                {loggedInUser?.username == loggedInUser?.username && (
                  <div className="card-profile__actions">
                    <Link href="/ProfileEdit">
                      <Btn
                        iconLeft={IconType.svg}
                        iconLink={<IoHammerOutline />}
                        caption={t('user.editProfile')}
                      />
                    </Link>
                    {selectedNetwork?.inviteOnly && 
                      <Link href="/Profile/Invites">
                        <Btn
                          iconLeft={IconType.svg}
                          iconLink={<IoPersonAddOutline />}
                          caption={t('invite.title')}
                        />
                      </Link>
                    }

                    {isAdmin && (
                      <AdminOptions/>
                    )}
                    
                    <Link href="/HomeInfo">
                      <div onClick={logout} className="btn-with-icon">
                        <div className="btn-with-icon__icon">
                          <IoLogOutOutline />
                        </div>
                        <span className="btn-with-icon__text">
                          {t('user.logout')}
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </Accordion>
              
            </LoadabledComponent>
          </Popup>
    </>
  );
}

function AdminOptions() {
  return (
    <>
      <div>
        <Link href="/Configuration">
          <Btn
            iconLeft={IconType.svg}
            iconLink={<IoBuildOutline />}
            caption={t('configuration.title')}
          />
        </Link>
      </div>
      <div>
        <Link href="/Configuration/Moderation">
          <Btn
            iconLeft={IconType.svg}
            iconLink={<IoCreateOutline />}
            caption={t('configuration.moderation')}
          />
        </Link>
      </div>
    </>
  );
}
