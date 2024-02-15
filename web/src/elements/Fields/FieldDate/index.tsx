//is the component or element integrated in buttonNewPublish. Right before activate button. It displays the current selected date and a button to chang it, that ddisplays a picker with the date options for the net that's selecte
import { Picker } from 'components/picker/Picker';
import React, { useState } from 'react';
import Btn, { BtnType, ContentAlignment } from 'elements/Btn';
import {
  DateTypes,
  readableDateTime,
  readableTime,
} from 'shared/date.utils';
import t from 'i18n';
import FieldRadio from '../FieldRadio';
import FieldRadioOption from '../FieldRadio/option';
import PickerEventTypeOnceForm from 'components/picker/PickerEventType/once';
import PickerEventTypeMultipleForm from 'components/picker/PickerEventType/multiple';
import FieldError from '../FieldError';
import PickerEventTypeRecurrentForm, { loadRrules, recurrentToText } from 'components/picker/PickerEventType/recurrent';

export default function FieldDate({
  title,
  eventType,
  setEventType,
  eventStart,
  eventEnd,
  setEventEnd,
  setEventStart,
  register,
  setEventData,
  eventData = null,
}) {
  const [showHideMenu, setHideMenu] = useState(false);
  const [invalidDates, setInvalidDates] = useState(false);
  
  const datesAreValid = () => {
    if (eventEnd?.getTime() < eventStart?.getTime()) {
      setInvalidDates(() => true);
      return false;
    }
    setInvalidDates(() => false);
    return true;
  };
  let closeMenu = () => {
    if (datesAreValid()) {
      setHideMenu(false);
    }
  };

  // https://www.npmjs.com/package/react-time-picker
  return (
    <>
      <div className="form__field">
        <ShowDate
          eventStart={eventStart}
          eventEnd={eventEnd}
          eventType={eventType}
          eventData={eventData}
          title={title}
        />
        <div className="btn" onClick={() => setHideMenu(true)}>
          {t('button.changeDateLabel')}
        </div>
      </div>
      {showHideMenu && (
        
        <Picker
          closeAction={closeMenu}
          headerText={t('eventType.headerText')}
        >
            <div className="picker__section">
              <EventType
                name="eventType"
                label={t('eventType.typePicker')}
                value={eventType}
                {...register('eventType')}
              />
              {eventType == DateTypes.ONCE && (
                <PickerEventTypeOnceForm
                  eventStart={eventStart}
                  eventEnd={eventEnd}
                  setEventEnd={setEventEnd}
                  setEventStart={setEventStart}
                  onChange={(datetime) => {}}
                  closeMenu={closeMenu}
                ></PickerEventTypeOnceForm>
              )}
              {eventType == DateTypes.MULTIPLE && (
                  <PickerEventTypeMultipleForm
                    eventStart={eventStart}
                    eventEnd={eventEnd}
                    setEventEnd={setEventEnd}
                    setEventStart={setEventStart}
                    onChange={(datetime) => {}}
                    closeMenu={closeMenu}
                  ></PickerEventTypeMultipleForm>
              )}
              {eventType == DateTypes.RECURRENT && (
                <PickerEventTypeRecurrentForm
                  rrule={loadRrules(eventData)}
                  setRrule={(rrule) => {setEventData(rrule); setEventStart(new Date(rrule.dtstart)); setEventEnd(new Date(rrule.until))}}
                  closeMenu={closeMenu}
                />
              )}
              {invalidDates && 
                <FieldError validationError={{message: 'invalid dates'}} />
              }
              <Btn
                btnType={BtnType.submit}
                caption={t('common.save')}
                contentAlignment={ContentAlignment.center}
                onClick={closeMenu}
              />
            </div>
        </Picker>
      )}
    </>
  );
}

const EventType = React.forwardRef(
  ({ name, onChange, onBlur, label, explain, value }, ref) => {
    const eventTypes = [
      {
        label: t('eventType.once'),
        explain: t('eventType.onceExplain'),
        type: DateTypes.ONCE,
      },
      {
        label: t('eventType.multipleDates'),
        explain: t('eventType.multipleExplain'),
        type: DateTypes.MULTIPLE,
      },
      {
        label: t('eventType.recurring'),
        explain: t('eventType.recurringExplain'),
        type: DateTypes.RECURRENT,
      },
    ];
    return (
      <>
        <FieldRadio label={label} explain={explain}>
          {eventTypes.map((eventType, idx) => (
            <div key={idx}>
              <FieldRadioOption
                onChange={(value) => onChange(value)}
                onBlur={onBlur}
                name={name}
                ref={ref}
                value={eventType.type}
                key={idx}
              >
                <div className="btn-filter__icon"></div>
                <div className="btn-with-icon__text">
                  {eventType.label}
                </div>
              </FieldRadioOption>
            </div>
          ))}
        </FieldRadio>
        {value &&
          eventTypes.find((eventType) => eventType.type == value)
            .explain}
      </>
    );
  },
);

export function ShowDate({
  eventStart,
  eventEnd,
  eventType,
  title,
  eventData
}) {
  return (
    <div className="card-button__date">
      {readableEventDateTime(eventType, eventStart, eventEnd, loadRrules(eventData))}
    </div>
  );
}

export function readableEventDateTime(
  eventType,
  eventStart,
  eventEnd,
  eventData
) {
  if (eventType == DateTypes.ONCE && eventStart && eventEnd) {
    return (
      readableDateTime(eventStart) +
      ' - ' +
      readableTime(eventEnd)
    );
  }
  if (eventType == DateTypes.MULTIPLE && eventStart && eventEnd) {
    return (
      t('dates.from') + ' ' + readableDateTime(eventStart) + ' ' +
      t('dates.until') + ' ' +
      readableDateTime(eventEnd)
    );
  }

  if (eventType == DateTypes.RECURRENT) {
    return (recurrentToText(eventData))
  }
}
