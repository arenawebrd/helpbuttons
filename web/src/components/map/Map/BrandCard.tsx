import React from 'react';
import { useStore } from 'store/Store';
import { GlobalState, store } from 'pages';
import { ShowDesktopOnly } from 'elements/SizeOnly';
import NetworkLogo from 'components/network/Components';
import Link from 'next/link';

export default function BrandCard({}) {

  const selectedNetwork = useStore(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
    false,
  );

  return (
    <>
        <div className="search-map__network-title">
              <ShowDesktopOnly>

                <div className="avatar-medium--home">
                  <Link href="/HomeInfo">
                    <NetworkLogo network={selectedNetwork} />
                  </Link>  

                </div>

              </ShowDesktopOnly>

              <div className='search-map__name'>
                <Link href="/HomeInfo">
                  {selectedNetwork.name}
                </Link>  
                <div className="search-map__sign">
                  <p>made with{' '}</p>
                  <a href="https://helpbuttons.org">{' '}Helpbuttons</a>
                </div>
              </div>
        </div>
    </>
  );
}
