import FieldUploadImage from "elements/Fields/FieldImageUpload";
import FieldPassword from "elements/Fields/FieldPassword";
import FieldText from "elements/Fields/FieldText";

export default function NewUserFields({register, errors, control, setValue, watch}) {
  return (
    <>
      <FieldText
        name="email"
        label="Email"
        classNameInput="squared"
        placeholder="email@email.em"
        validationError={errors.email}
        {...register('email', { required: true })}
      ></FieldText>
      <FieldText
        name="username"
        label={`Username ${watch('username')}@${window.location.hostname}`}
        classNameInput="squared"
        placeholder="username"
        validationError={errors.username}
        {...register('username', { required: true })}
      ></FieldText>
      <FieldPassword
        name="password"
        label="Password"
        classNameInput="squared"
        placeholder="Type your password"
        validationError={errors.password}
        {...register('password', { required: true, minLength: 8 })}
      ></FieldPassword>
      <FieldPassword
        name="password_confirm"
        label="Password confirmation"
        classNameInput="squared"
        placeholder="Type your password again please"
        validationError={errors.password}
        {...register('password_confirm', { required: true, minLength: 8 })}
      ></FieldPassword>
      150x150px
      <FieldUploadImage
        name="avatar"
        label="Choose avatar"
        control={control}
        width={150}
        height={150}
        validationError={errors.avatar}
        setValue={setValue}
        {...register('avatar', { required: true })}
      />
    </>
  );
}
