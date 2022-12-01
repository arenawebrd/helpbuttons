// create admin!
// username
// email
// password

import Popup from "components/popup/Popup";
import Btn, { BtnType, ContentAlignment } from "elements/Btn";
import Form from "elements/Form";
import { useRouter } from "next/router";
import { useForm } from 'react-hook-form';

export default CreateAdmin;

function CreateAdmin() {
    const {
        handleSubmit,
        formState: { isSubmitting },
      } = useForm({
        // defaultValues: {
        // }
      });
    
    const router = useRouter()

    const onSubmit = (data) => {
        router.replace('/Setup/FirstOpen')
    };
    
    return (
    <>
      <Popup title="Create Admin User">
        <Form classNameExtra="createAdmin">
          <div className="form__btn-wrapper">
                  <Btn 
                    btnType={BtnType.splitIcon} 
                    caption="NEXT"
                    contentAlignment={ContentAlignment.center} 
                    isSubmitting={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                  />
          </div>
      </Form>            
      </Popup>
    </>
    );
}