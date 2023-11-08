import { DropdownField } from "elements/Dropdown/Dropdown"
import t from "i18n"
import { getLocale } from "shared/sys.helper"

export const FieldLanguagePick = ({onChange, explain, label, defaultValue}) => {

    return (
        <DropdownField
        options={[
          { value: 'en', name: 'English' },
          { value: 'es', name: 'Español' },
        ]}
        explain={explain}
        defaultSelected={defaultValue}
        onChange={onChange}
        label={t('user.pickLanguageLabel')}
      />
    )
}