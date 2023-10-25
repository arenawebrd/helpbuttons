import CardButton from 'components/button/CardButton';
import Feed from 'layouts/Feed';
import { NextPageContext } from 'next';
import SEO from 'components/seo';
import { ServerPropsService } from 'services/ServerProps';
import { Button } from 'shared/entities/button.entity';
import { makeImageUrl } from 'shared/sys.helper';
import { useButtonTypes } from 'shared/buttonTypes';
import { useEffect, useState } from 'react';
import { HttpStatus } from 'shared/types/http-status.enum';
import Router from 'next/router';
import PopupButtonFile from 'components/popup/PopupButtonFile';
import Popup from 'components/popup/Popup';
export default function ButtonFile({
  metadata,
  currentButton,
}) {
  const [buttonTypes, setButtonTypes] = useState([]);
  useButtonTypes(setButtonTypes);

  useEffect(() => {
    if(!currentButton)
  {
    Router.push('/Error')
  }
  }, [currentButton])
  
  return (
    <>
      <SEO {...metadata} />
      {currentButton && 
            <Popup
            sectionClass=''
            linkFwd="/Activity"
            >

                {buttonTypes?.length > 0 && (
                  <CardButton
                    button={currentButton}
                    buttonTypes={buttonTypes}
                  />
                )}

                <Feed button={currentButton} />
                
            </Popup> 
      }
    </>
  );
}

export const getServerSideProps = async (ctx: NextPageContext) => {
  const serverProps = await ServerPropsService.general(
    'New Button',
    ctx,
  );
  const buttonUrl = `${process.env.API_URL}/buttons/findById/${ctx.params.id}`;
  const currentButtonFetch = await fetch(buttonUrl, {
    next: { revalidate: 10 },
  });
  const currentButtonData: Button = await currentButtonFetch.json();
  if(currentButtonData?.statusCode == HttpStatus.NOT_FOUND)
  {
    return {props: serverProps};
  }
  const serverPropsModified = {
    ...serverProps,
    metadata: {
      ...serverProps.metadata,
      title: currentButtonData.title,
      description: currentButtonData.description,
      image: `${makeImageUrl(
        currentButtonData.image,
        serverProps.config.hostName + '/api',
      )}`,
    },
  };

  return {
    props: {
      ...serverPropsModified,
      currentButton: await currentButtonData,
    },
  };
};
