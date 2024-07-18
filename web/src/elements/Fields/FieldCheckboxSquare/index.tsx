import CheckBox from "elements/MultiSelectOption";
import React, { useEffect, useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import FieldError from "../FieldError";
import t from "i18n";


export const FieldCheckboxSquare = React.forwardRef(({
    label,
    name,
    explain,
    text,
    onChanged = (value) => {console.log(value)},
    defaultValue = false,
    textOn = null,
    validationError = false,
  }, ref) => {
    const [checked, setChecked] = useState(defaultValue)

    const onChange = () => {
      setChecked((prevValue) => {
        onChanged(!prevValue)
        return !prevValue
      })
      
    }
    return (
    <div className="form__field">
    <label className="form__label">{label}</label>
    <p className="form__explain">{explain}</p>

    <div className="checkbox">
        <label className="checkbox__label--square">
          <input
            type="checkbox"
            className="checkbox__checkbox"
            name={name}
            checked={checked}
            ref={ref} 
            onChange={onChange}
          ></input>
          <div className="btn-with-icon__text">
            {(textOn && checked) ? textOn : text}
          </div>
          <div className={`btn-filter ${checked ? 'checked' : ''}`}>
           <div className="btn-filter__icon">{checked && <IoCheckmark/>}</div>
          </div>

        </label>
        <FieldError validationError={validationError} />
      </div> 
      </div>
      )
  })