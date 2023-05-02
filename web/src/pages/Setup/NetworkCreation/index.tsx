import NetworkForm from 'components/network/NetworkForm';
import Popup from 'components/popup/Popup';
import t from 'i18n';
import router from 'next/router';
import { GlobalState, store } from 'pages';
import Configuration from 'pages/Configuration';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { alertService } from 'services/Alert';
import { SetupSteps } from 'shared/setupSteps';
import { defaultMarker } from 'shared/sys.helper';
import { Role } from 'shared/types/roles';
import { CreateNetwork, FetchDefaultNetwork } from 'state/Networks';
import { useRef } from 'store/Store';

// name, description, logo, background image, button template, color pallete, colors
export default NetworkCreation;

function NetworkCreation() {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    setFocus,
    control,
    setValue,
    watch,
    setError,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      jumbo: '',
      tags: [],
      latitude: defaultMarker.latitude,
      longitude: defaultMarker.longitude,
      zoom: 10,
      privacy: 'public',
      address: '',
    },
  });

  const loggedInUser = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
  );

  const onSubmit = (data) => {
    store.emit(
      new CreateNetwork(
        {
          name: data.name,
          description: data.description,
          radius: 10,
          latitude: data.latitude,
          longitude: data.longitude,
          tags: data.tags,
          privacy: 'public',
          logo: data.logo,
          jumbo: data.jumbo,
          zoom: data.zoom,
          address: data.address,
          hexagons: data.hexagons,
          resolution: data.resolution
        },
        () => {
          const onComplete = () => {
            alertService.info(t('common.saveSuccess', ['instance']));
            router.replace('/HomeInfo');
          };
          store.emit(
            new FetchDefaultNetwork(onComplete, (error) => {
              console.log(error);
            }),
          );
        },
        (err) => {
          if (err?.message.indexOf('validation-error') === 0) {
            const mimetypeError = 'invalid-mimetype-';
            if (
              err?.validationErrors?.jumbo &&
              err.validationErrors.jumbo.indexOf(mimetypeError) === 0
            ) {
              const mimetype = err.validationErrors.jumbo.substr(
                mimetypeError.length,
              );
              const mimetypeErrorMessage = t(
                'common.invalidMimeType',
                ['jumbo', mimetype],
              );
              setError('jumbo', {
                type: 'custom',
                message: mimetypeErrorMessage,
              });
            } else if (
              err?.validationErrors?.logo &&
              err.validationErrors.logo.indexOf(mimetypeError) === 0
            ) {
              const mimetype = err.validationErrors.logo.substr(
                mimetypeError.length,
              );
              const mimetypeErrorMessage = t(
                'common.invalidMimeType',
                ['logo', mimetype],
              );
              setError('logo', {
                type: 'custom',
                message: mimetypeErrorMessage,
              });
            } else {
              alertService.warn(
                `Validation errors ${JSON.stringify(err)}`,
              );
            }
          } else {
            console.log(err);
          }
        },
      ),
    );
  };
  return (
    <>
      {loggedInUser?.role == Role.admin && (
        <Popup title={t('setup.configureInstanceTitle')}>
          <NetworkForm
            captionAction={t('setup.finish')}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            register={register}
            setValue={setValue}
            watch={watch}
            setFocus={setFocus}
            isSubmitting={isSubmitting}
            control={control}
            errors={errors}
            linkFwd="/Setup/NetworkCreation"
            showClose={false}
            description={t('setup.configureInstanceDescription')}
          />
        </Popup>
      )}
    </>
  );
}
