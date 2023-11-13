import { ImageContainer, ImageType } from 'elements/ImageWrapper';
import React from 'react';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import ImageUploading from 'react-images-uploading';

import Btn, { BtnType, ContentAlignment, IconType } from 'elements/Btn';
import { IoChevronBackOutline } from "react-icons/io5";
import { IoClose } from 'react-icons/io5';

import FieldError from '../FieldError';
import t from 'i18n';

export const FieldImageUpload = React.forwardRef(({ name, text, label, explain, subtitle, width = 100, height = 100, alt = "", validationError, control, setValue }, ref) => {

  const [image, setImage] = useState(null)
  const onChange = (imageList, addUpdateIndex) => {
    setImage(imageList[0].data_url)
    if (imageList.length > 0) {
      setValue(name, imageList[0].data_url)
    }
  };

  const value = useWatch({ control, name: name });

  useEffect(() => {
    if (value) {
      setImage(value);
    }
  }, [value])
  return (
    <>
      <div className="form__field">
        <div className='form__label'>{label}</div>
        <div className='form__explain'>{explain}</div>
        <ImageUploading
          value={image}
          onChange={onChange}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({ onImageUpload, onImageRemove }) => (
            // write your building UI
            <div className="form__image-upload-wrapper">
              <label
                htmlFor="files"
                className="btn"
                onClick={(e) => {
                  setImage(null);
                  e.preventDefault();
                  onImageUpload();
                }}
              >
                {text}
              </label>
              <div className="form__input-subtitle">
                      <div className="form__input-subtitle-side">
                        <label className="form__input-subtitle--text">
                          {subtitle}
                        </label>
                      </div>
              </div>
              <div className='form__image-upload-preview--wrap'>
                {image && (
                    <div className='form__image-upload-preview--file'>
                        <div className='form__image-upload-preview--image'>
                          <ImageContainer
                            src={image}
                            imageType={ImageType.preview}
                            alt={alt}
                            width={width}
                            height={height}
                          />
                        </div>

                        <Btn
                          btnType={BtnType.circle}
                          iconLink={<IoClose/>}
                          iconLeft={IconType.svg}
                          extraClass={"form__image-upload--remove-icon"}
                          onClick={(e) => {
                            e.preventDefault();
                            onImageRemove(0);
                          }}
                        />

                    </div>
                )}
              </div>
            </div>
          )}
        </ImageUploading>
        {validationError &&
          <FieldError validationError={validationError} />
        }
      </div>
    </>
  );
});
// export default function FieldImageUpload({ name, label, width = 100, height = 100, alt = "", validationError, control, setValue}) {

//   return (<></>)

// }
