import Btn, { BtnType, ContentAlignment, IconType } from 'elements/Btn';
import FieldImageUploads from 'elements/Fields/FieldImagesUpload';
import { FieldTextArea } from 'elements/Fields/FieldTextArea';
import Form from 'elements/Form';
import t from 'i18n';
import { InsertedSignUpForm } from 'pages/Signup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IoMailOutline, IoPaperPlaneOutline } from 'react-icons/io5';
import { uniqueArray } from 'shared/sys.helper';

export default function MessageNew({
  onCreate,
  mentions = [],
  privateMessage = false,
  isComment = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { message: '', images: [] } });

  const onSubmitLocal = (data) => {
    setValue('message', '');
    setValue('images', []);
    onCreate(data.message, data.images);
  };

  useEffect(() => {
    if (mentions.length > 0) {
      mentions = uniqueArray(mentions);
      setValue(
        'message',
        mentions.reduce(
          (strOut, mention) => strOut + `@${mention} `,
          '',
        ),
      );
    }
  }, [mentions]);

  useEffect(() => {
    setFocus('message')
  }, [])
  return (
    <>
      <div className="button-file__action-section--field">
        <Form
          onSubmit={handleSubmit(onSubmitLocal)}
          classNameExtra="feeds__new-message"
        >
          <div className="feeds__new-message-message">
            <FieldTextArea
              name="message"
              setValue={setValue}
              placeholder={
                isComment
                  ? t('comment.placeholderWrite')
                  : t('post.placeholderWrite')
              }
              validationError={errors.message}
              {...register('message', { required: true })}
              maxLength={500}
              watch={watch}
              setFocus={setFocus}
            />
            {/* {isComment && !privateMessage && (
              <div className="form__input-subtitle-side">
                <label className="form__input-subtitle--error">
                  {t('comment.public')}
                </label>

              </div>
            )} */}
            {isComment && privateMessage && (
              <div className="form__input-subtitle-side">
                <label className="form__input-subtitle--error">
                  {t('comment.private')}
                </label>
              </div>
            )}
            <FieldImageUploads 
              defaultImages={watch('images')}
              name='images'
              text={t('button.imagesText')} 
              maxNumber={5}
              setValue={(images) => setValue('images', images)}
              validationError={null}
            />
          </div>
          <Btn
              submit={true}
              btnType={BtnType.corporative}
              caption={t("comment.send")}
              iconLink={<IoPaperPlaneOutline />}
              iconLeft={IconType.svg}
              contentAlignment={ContentAlignment.center}
            />
        </Form>
      </div>
    </>
  );
}
