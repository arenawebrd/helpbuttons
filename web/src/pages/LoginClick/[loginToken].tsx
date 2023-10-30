//Form component with the main fields for signup in the platform
//imported from libraries
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { store } from 'pages';
import { useToggle } from 'shared/custom.hooks';
import { LoginToken } from 'state/Users';
import { alertService } from 'services/Alert';
import t from 'i18n';

export default function LoginClick() {
  
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useToggle(false)
  useEffect(() => {
    const onSuccess = () => {
      let returnUrl: string = '/HomeInfo';
      if (router?.query?.returnUrl) {
        returnUrl = router.query.returnUrl.toString();
      }
      alertService.success(t('user.loginSucess'))
      store.emit(router.push(returnUrl));
    };
  
    const onError = (err) => {
      alertService.error('failed to login, please try again');
      router.push('/HomeInfo')
    };
    if (!loggingIn)
    {
      if(!router.isReady)
      {
        return;
      }
      setLoggingIn(true)
      const loginToken = router.query.loginToken as string;
      store.emit(new LoginToken(loginToken, onSuccess,onError))
    }
  }, [router.isReady])


  return (
    <>
      <div>Logging in...</div>
    </>
    
  );
}
