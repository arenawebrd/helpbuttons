import { NextPageContext } from 'next';
import HoneyComb from '../HoneyComb';
import { setMetadata } from 'services/ServerProps';
import { ClienteSideRendering } from 'pages/_app';
import { LoadabledComponent } from 'components/loading';
import t from 'i18n';
import { useStore } from 'store/Store';
import { GlobalState, store } from 'pages';

export default function Explore({
  metadata
}) {
  const selectedNetwork = useStore(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
  );
  return (
    <>
      <ClienteSideRendering>
        <LoadabledComponent loading={!selectedNetwork}>
          <HoneyComb selectedNetwork={selectedNetwork} />
        </LoadabledComponent>
      </ClienteSideRendering>
    </>
  );
}

export const getServerSideProps = async (ctx: NextPageContext) => {
  return setMetadata(t('menu.explore'), ctx);
};
