import React from "react";
import FieldError from "../FieldError";

interface IFieldText {
    label: string,
    handleChange: Function,
    name: string,
    validationError: any,
    classNameInput?: string,
    placeholder?: string   
}

const FieldText = React.forwardRef(({
    label,
    name,
    classNameInput,
    placeholder,
    onChange,
    onBlur,
    validationError,
    value,
    explain,
}, ref): IFieldText => {
    return (
        <div className="form__field">
            <label className="form__label">{label}</label>
            <p className="form__explain">{explain}</p>
            <input
                name={name} 
                ref={ref}
                type="text"
                placeholder={ placeholder ? placeholder : label}
                onChange={onChange}
                onBlur={onBlur}
                className={`form__input ${classNameInput} ${validationError ? 'validation-error' : ''}`} 
                value={value}
            />
            <FieldError validationError={validationError}/>
        </div>
    );
});

export default FieldText;

