import { NextPageContext } from 'next';
import HoneyComb from '../HoneyComb';
import { ServerPropsService } from 'services/ServerProps';
import { ClienteSideRendering } from 'pages/_app';
import { Button } from 'shared/entities/button.entity';
import { HttpStatus } from 'shared/types/http-status.enum';
import { makeImageUrl } from 'shared/sys.helper';
import { LoadabledComponent } from 'components/loading';
import { useEffect } from 'react';
import { useSelectedNetwork } from 'state/Networks';

export default function Explore({
  metadata,
  _selectedNetwork,
  config,
}) {
  const selectedNetwork = useSelectedNetwork(_selectedNetwork)
  
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
  const serverProps = await ServerPropsService.general(
    'Explore',
    ctx,
  );  
  if (ctx.query?.btn) {
    const btnId = ctx.query.btn;
    const buttonUrl = `${process.env.API_URL}/buttons/findById/${btnId}`;
    const currentButtonFetch = await fetch(buttonUrl, {
      next: { revalidate: 10 },
    });
    const currentButtonData: Button = await currentButtonFetch.json();
    if (currentButtonData?.statusCode == HttpStatus.NOT_FOUND) {
      return { props: serverProps };
    }
    const serverPropsModified = {
      ...serverProps,
      metadata: {
        ...serverProps.metadata,
        title: currentButtonData.title,
        description: currentButtonData.description,
        image: `${makeImageUrl(
          currentButtonData.image
        )}`,
      },
    };
    return {
      props: {
        ...serverPropsModified,
        currentButton: await currentButtonData,
      },
    };
  }
  return { props: serverProps };
};