import React, { useState } from "react";
import FieldError from "../FieldError";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { SearchIndex } from 'emoji-mart'

export const FieldTextArea = React.forwardRef((props, ref) => {

  const {
    label,
    name,
    validationError,
    placeholder,
    classNameExtra,
    watch,
    setValue,
    setFocus,
    explain,
    maxLength = -1
  } = props;
/*
  const [foundEmojies, setFoundEmojies] = useState([])
  const [showEmojiDropDown, setShowEmojiDropDown] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)


  const handleChange = (event) => {
   
    const firstDoublePoint = event.target.value.search(":") ;
    const countDoublePoint = event.target.value.split(":") ;
    const cursorPosition = event.target.selectionEnd

    if (firstDoublePoint > 0 && countDoublePoint.length % 2 == 0) {
      const searchString = countDoublePoint[countDoublePoint.length-1];
      if (searchString) 
      {
        const emojis = SearchIndex.search(searchString).then((emojies ) => {
          if (emojies && emojies.length > 0)
          {
            setShowEmojiDropDown(true)
            setFoundEmojies(emojies)
            return;
          }
        })
      }
    }
    setShowEmojiDropDown(false)
    setFoundEmojies([])
    setValue(name, `${event.target.value}`)
  }
  const addEmojiToTextAreaFromDropDown = (emoji) => {
    setShowEmojiDropDown(false)
    addEmojiToTextArea({native: emoji})
  }

  const addEmojiToTextArea = (emoji) => {
    // console.log(emoji)
    const value = watch(name)
    // console.log(emoji)
    setValue(name, `${value}${emoji.native}`)
    setFocus(name, { shouldSelect: false })
    setShowEmojiPicker(false)
    return true;
  }
  const handleShowEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }*/
  const handleChange = (event) => {
    setValue(name, `${event.target.value}`)
  }
    const [textLength, setTextLength] = useState(0);
     const onInput = (obj) => {
        if (maxLength > 0){
            if ( obj.target.value.length > maxLength) {
                obj.target.value = obj.target.value.slice(0, maxLength)
            }
            setTextLength(obj.target.value.length)
        } 
    }
    return (
      <>
      <div className="form__field">
        <p className="form__label">{label}</p>
        <p className="form__explain">{explain}</p>
        
        <textarea
          onChange={(event) => {handleChange(event)}}
          name={name}
          className={`${classNameExtra} textarea__textarea`}
          placeholder={placeholder}
          ref={ref}
          onInput={onInput}
        ></textarea>
        {maxLength > 0 && 
          <div className="form__input--text-length">{textLength} / {maxLength}</div>
        }
        {/*<>
        {showEmojiDropDown && 
        foundEmojies.map((emoji, idx) => {
          
          return (<p onClick={() => addEmojiToTextAreaFromDropDown(emoji.skins[0].native)}>{emoji.skins[0].native} (:{emoji.id}:)</p>)
        })
        }
        </>
        <div onClick={handleShowEmojiPicker}>😀</div>
        {showEmojiPicker && 
          <Picker data={data} onEmojiSelect={addEmojiToTextArea} />
        */}
        <FieldError validationError={validationError} />
      </div>
    </>
    );
});


