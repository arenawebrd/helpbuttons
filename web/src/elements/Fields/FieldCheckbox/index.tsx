import CheckBox from "elements/MultiSelectOption";
import React, { useEffect, useState } from "react";
import { IoCheckmark } from "react-icons/io5";


export const FieldCheckbox = React.forwardRef(({
    label,
    name,
    explain,
    text,
    onChanged = () => {},
    defaultValue = false,
  }, ref) => {
    const [checked, setChecked] = useState(defaultValue)

    useEffect(() => {
      onChanged(checked)
    }, [checked])

    const onChange = () => {
      setChecked((prevValue) => !prevValue)
    }
    return (
    <div className="form__field">
    <p className="form__label">{label}</p>
    <p className="form__explain">{explain}</p>

    <div className="checkbox">
        <label className="checkbox__label">
          <input
            type="checkbox"
            className="checkbox__checkbox"
            name={name}
            checked={checked}
            ref={ref} 
            onChange={onChange}
          ></input>
          <div
            className={`checkbox__content ${checked ? 'checked' : ''}`}
          >
              <div className="btn-filter__icon">{checked && <IoCheckmark/>}</div>
                <div className="btn-with-icon__text">
                    {text}
                </div>
           </div>
        </label>
      </div> 
      </div>
      )
  })