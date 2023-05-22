import { useRef } from 'store/Store';

import { GlobalState, store } from 'pages';
import router from 'next/router';
import t from 'i18n';
import NetworkLogo from 'components/network/Components';
import { HeaderSearch } from 'elements/HeaderSearch'; 
import NavLink from 'elements/Navlink';
import {
  IoAddOutline,
  IoGlobeOutline,
  IoHelpOutline,
  IoLogInOutline,
} from 'react-icons/io5';
import { getHostname } from 'shared/sys.helper';
import { SetupDtoOut } from 'shared/entities/setup.entity';
import DropDownSearchLocation from 'elements/DropDownSearchLocation';
import { useEffect, useState } from 'react';
import { updateExploreMapZoom, updateMapCenter } from 'state/Explore';
import { Network } from 'shared/entities/network.entity';

export default function HomeInfo() {
  const selectedNetwork: Network = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
  );
  const selectedNetworkLoading = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetworkLoading,
  );

  const currentUser = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
  );

  const config: SetupDtoOut = useRef(
    store,
    (state: GlobalState) => state.config,
  );

  const [navigatorCoordinates, setNavigatorCoordinates] = useState(null)
  
  useEffect(() => {
    if(navigator)
    {
    navigator.geolocation.getCurrentPosition(function(position) {
      setNavigatorCoordinates(position.coords)
    });
  }
  }, [navigator])
  
  const handleSelectedPlace = (place) => {
    router.push({
      pathname: '/Explore',
      query: place.geometry,
    });
  };

  return (
    <>
    {selectedNetwork && (
      <div style={{ "--network-jumbo": `url('/api/${selectedNetwork.jumbo}'` } as React.CSSProperties}>
    <div className="info-overlay__container">
      <div className="info-overlay__content">
        <form className="info-overlay__search-section">

          <NavLink href="/Explore">
              <HeaderSearch/>
          </NavLink>
          
        </form>
        {selectedNetworkLoading && (
          <>
            <div className="info-overlay__card">{t('homeinfo.loading')}</div>
          </>
        )}
        
          <>
           
            <div className="info-overlay__card">
              {navigatorCoordinates && 
              <div className="card">
                <div className="card__header">
                  <h3 className="card__header-title">{t('homeinfo.locationDetected')}<a href={`/Explore?lat=${navigatorCoordinates.latitude}&lng=${navigatorCoordinates.longitude}&zoom=13`}>{t('common.click')}</a></h3>
                </div>
              </div>
              }
              <div className="card">
                <div className="card__header">
                  <div className="avatar-medium">
                    <NetworkLogo network={selectedNetwork} />
                  </div>
                  <h3 className="card__header-title network-title">
                    {selectedNetwork.name}
                  </h3>
                </div>
                <div className="info-overlay__description">
                  {selectedNetwork.description}
                </div>
                <div className="info-overlay__hashtags">
                  {selectedNetwork.tags.map((tag) => {return (
                    <div className="hashtag">{tag}</div>)})
                  }
                </div>
              </div>
              <div className="card">
                <div className="card__header">
                  <h3 className="card__header-title">
                    {t('homeinfo.stats')}
                  </h3>
                </div>
                <div className="info-overlay__description">
                  <div>{t('homeinfo.buttons', [config.buttonCount.toString()])}</div>
                  <div>{t('homeinfo.users', [config.userCount.toString()])}</div>
                  <div>
                    {t('homeinfo.administeredby')}
                    <NavLink
                      href={`/Profile/${selectedNetwork.administrator.username}`}
                    >
                      <span>
                        {selectedNetwork.administrator.username}@
                        {getHostname()}
                      </span>
                    </NavLink>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card__header">
                  <h3 className="card__header-title">{t('homeinfo.actions')}</h3>
                </div>
                <div>
                  <NavLink href="/Explore">
                    <span>
                      <IoGlobeOutline />
                      {t('menu.explore')}
                    </span>
                  </NavLink>
                  <p>{t('homeinfo.exploreSubtitle')}</p>
                </div>
                <div>
                  <NavLink href="/ButtonNew">
                    <span>
                      <IoAddOutline />
                      {t('menu.create')}
                    </span>
                  </NavLink>
                  <p>{t('homeinfo.createSubtitle')}</p>
                </div>
                <div>
                  <NavLink href="/Explore">
                    <span>
                      <IoHelpOutline />
                      {t('menu.faqs')}
                    </span>
                  </NavLink>
                  <p>{t('homeinfo.faqsSubtitle')}</p>
                </div>
                {currentUser && (
                  <>
                    <div>
                      <NavLink href="/Profile">
                        <span>
                          <IoLogInOutline />
                          {t('menu.profile')}
                        </span>
                      </NavLink>
                      <p>{t('homeinfo.profileSubtitle')}</p>
                    </div>
                  </>
                )}
                {!currentUser && (
                  <div>
                    <NavLink href="/Login">
                      <span>
                        <IoLogInOutline />
                        {t('menu.login')}
                      </span>
                    </NavLink>
                    <p>{t('homeinfo.loginSubtitle')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="info-overlay__card"></div>
          </>
        
      </div>
    </div></div>)}</>
  );
}
