//Form component with the main fields for signup in the platform
//imported from libraries
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

//imported internal classes, variables, files or functions
import { GlobalState, store } from 'pages';
import { FetchUserData, UpdateProfile } from 'state/Users';

//imported react components
import { Link } from 'elements/Link';
import Popup from 'components/popup/Popup';
import Btn, {
  ContentAlignment,
  BtnType,
} from 'elements/Btn';
import Form from 'elements/Form';

import { useRouter } from 'next/router';

import FieldText from 'elements/Fields/FieldText';
import { alertService } from 'services/Alert';
import { User } from 'shared/entities/user.entity';
import { useRef } from 'store/Store';
import { FieldImageUpload } from 'elements/Fields/FieldImageUpload';
import FieldPassword from 'elements/Fields/FieldPassword';
import { getHostname } from 'shared/sys.helper';
import { UserUpdateDto } from 'shared/dtos/user.dto';
import { FieldTextArea } from 'elements/Fields/FieldTextArea';
import t from 'i18n';
import { FieldLanguagePick } from 'elements/Fields/FieldLanguagePick';

export default function ProfileEdit() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    watch,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({defaultValues: {
    locale: 'en'
  }});
  const [errorMsg, setErrorMsg] = useState(undefined);
  const [setNewPassword, setSetNewPassword] = useState(false);

  const router = useRouter();

  const loggedInUser: User = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
  );
  const [locale, setLocale] = useState(null)

  const onSubmit = (data: UserUpdateDto) => {
    const dataToSubmit : UserUpdateDto =
    {
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      password_current: data.password_current,
      password_new: data.password_new,
      password_new_confirm: data.password_new_confirm,
      set_new_password: setNewPassword,
      description: data.description,
      locale: locale
    }

    if (setNewPassword)  {
      // check passwords match.. send to backend
      if (dataToSubmit.password_new != dataToSubmit.password_new_confirm)
      {
        setError('password_new',  { type: 'custom', message: t('user.passwordMismatch')})
        setError('password_new_confirm',  { type: 'custom', message: t('user.passwordMismatch')})
      }
    }
    
    store.emit(new UpdateProfile(dataToSubmit, onSuccess, onError));
  };

  const onSuccess = () => {
    
    store.emit(new FetchUserData((userData) => {
      router.push(`${userData.locale}/Profile`)
    }, onError));
    ;
  };

  const onError = (errorMessage) => {
    alertService.error(errorMessage.caption);
  };

  useEffect(() => {
    if (loggedInUser) {
      setLocale(loggedInUser.locale)
      reset(loggedInUser);
    }
  }, [loggedInUser]);
  return (
    <>
      {loggedInUser && (
        <>
          <Popup title="Update profile" linkFwd="/HomeInfo">
            <Form
              onSubmit={handleSubmit(onSubmit)}
              classNameExtra="login"
            >
              <div>{t('user.editProfile')} </div>
              {loggedInUser.username}@{getHostname()}
                <div className="form__inputs-wrapper">
                  <FieldText
                    name="name"
                    label={t('user.name')}
                    classNameInput="squared"
                    placeholder={t('user.namePlaceHolder')}
                    validationError={errors.email}
                    {...register('name', { required: true })}
                  ></FieldText>
                  {locale && 
                    <FieldLanguagePick onChange={(value) => setLocale(value)}/>
                  }
                  <FieldText
                    name="email"
                    label={t('user.email')}
                    classNameInput="squared"
                    placeholder={t('user.emailPlaceHolder')}
                    validationError={errors.email}
                    {...register('email', { required: true })}
                  ></FieldText>
                  <FieldTextArea
                    name="description"
                    label={t('user.description')}
                    classNameInput="squared"
                    watch={watch}
                    setValue={setValue}
                    setFocus={setFocus}
                    validationError={errors.description}
                    {...register('description', { required: true })}
                  />
                  
                  <FieldImageUpload
                    name="avatar"
                    label={t('user.avatar')}
                    control={control}
                    width={150}
                    height={150}
                    subtitle={'150x150px'}
                    validationError={errors.avatar}
                    setValue={setValue}
                    {...register('avatar', { required: true })}
                  />
                </div>
                {errorMsg && (
                  <div className="form__input-subtitle--error">
                    {errorMsg}
                  </div>
                )}

                <div
                    className="btn accordion"
                    onClick={() =>
                      setSetNewPassword(!setNewPassword)
                    }                    
                  >
                    {!setNewPassword ?  t('user.setNewPassword') : t('user.dontChangePassword') }
                    
                </div>
                  {setNewPassword && (
                      <>
                        <FieldPassword
                          name="password_current"
                          label={t('user.password')}
                          classNameInput="squared"
                          placeholder={t('user.passwordPlaceHolder')}
                          validationError={errors.password}
                          {...register('password_current', {
                            minLength: 8,
                          })}
                        ></FieldPassword>

                        <FieldPassword
                          name="password_new"
                          label={t('user.newPassword')}
                          classNameInput="squared"
                          placeholder={t('user.newPasswordPlaceHolder')}
                          validationError={errors.password}
                          {...register('password_new', {
                            minLength: 8,
                          })}
                        ></FieldPassword>
                        <FieldPassword
                          name="password_new_confirm"
                          label={t('user.passwordPlaceHolder')}
                          classNameInput="squared"
                          placeholder={t('user.passwordConfirmationPlaceHolder')}
                          validationError={errors.password}
                          {...register('password_new_confirm', {
                            minLength: 8,
                          })}
                        ></FieldPassword>
                      </>
                    )}
                    <div className="publish__submit">
                      <Btn
                        btnType={BtnType.submit}
                        contentAlignment={ContentAlignment.center}
                        caption={t('common.publish')}
                        isSubmitting={isSubmitting}
                        submit={true}
                      />
                    </div>
            </Form>
          </Popup>
        </>
      )}
    </>
  );
}
