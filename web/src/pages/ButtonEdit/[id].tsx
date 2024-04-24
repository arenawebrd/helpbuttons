import ButtonForm from 'components/button/ButtonForm';
import { GlobalState, store } from 'pages';
import {
  CreateButton,
  FindButton,
  SaveButtonDraft,
  UpdateButton,
} from 'state/Explore';
import { NavigateTo } from 'state/Routes';
import { useRef } from 'store/Store';
import { alertService } from 'services/Alert';
import { Button } from 'shared/entities/button.entity';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UpdateButtonDto } from 'shared/dtos/button.dto';
import t from 'i18n';
import { useRouter } from 'next/router';

export default function ButtonEdit() {
  const selectedNetwork = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
  );


  const {
    register,
    handleSubmit,
    formState: {
      isDirty,
      dirtyFields,
      touchedFields,
      errors,
    },
    control,
    reset,
    watch,
    setValue,
    getValues,
    setFocus,
  } = useForm();

  const [button, setButton] = useState<Button>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [id, setId] = useState(null)
  const router = useRouter()
  const onSubmit = (data) => {
    setIsSubmitting(() => true)

    store.emit(
      new UpdateButton(id,
        data,
        onSuccess,
        onError,
      ),
    );
  };

  const onSuccess = (data) => {

    router.push(`/Explore?lat=${data.lat}&lng=${data.lng}&btn=${data.id}`);
  };

  const onError = (errorMessage) => {
    alertService.error(errorMessage.caption);
    setIsSubmitting(() => false);
  };
  useEffect(() => {
    if(!router.isReady){
      return;
    }
    setId(() => router.query.id as string)
  }, [router.isReady])
  useEffect(() => {
    if (id != null) {
      store.emit(
        new FindButton(
          id,
          (buttonFetched) => {
            setButton(buttonFetched);
            reset(buttonFetched);
          },
          (errorMessage) => {
            alertService.error(errorMessage.caption);
          },
        ),
      );
    }
  }, [id]);
  return (
    <>
    {button &&
      <ButtonForm
        watch={watch}
        reset={reset}
        getValues={getValues}
        handleSubmit={handleSubmit}
        register={register}
        errors={errors}
        control={control}
        setFocus={setFocus}
        setValue={setValue}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        title={t('common.editTitle', ['button'])}
      ></ButtonForm>
    }
    </>
  );
}
