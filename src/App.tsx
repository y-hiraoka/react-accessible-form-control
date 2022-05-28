import { useForm } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormInputControl,
  FormLabel,
  FormTextAreaControl,
} from "./form-control";
import styles from "./Home.module.css";

const App = () => {
  const { register, formState, handleSubmit } = useForm<{
    name: string;
    description: string;
  }>();

  const onSubmit = handleSubmit(data => console.log(data));

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <FormControl
        isInvalid={formState.errors.name !== undefined}
        className={styles.formControl}>
        <FormLabel className={styles.formLabel}>おなまえ</FormLabel>
        <FormInputControl
          className={styles.formInputControl}
          {...register("name", { required: true })}
        />
        <FormHelperText className={styles.formHelperText}>
          ぜったいににゅうりょくしてね
        </FormHelperText>
        <FormErrorMessage className={styles.formErrorMessage}>
          入力してって言ってんの
        </FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={formState.errors.description !== undefined}
        className={styles.formControl}>
        <FormLabel className={styles.formLabel}>じこしょうかい</FormLabel>
        <FormTextAreaControl
          className={styles.formTextAreaControl}
          {...register("description", {
            pattern:
              /^[\sあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]*$/,
          })}
        />
        <FormHelperText className={styles.formHelperText}>
          140もじのひらがなででかいてね
        </FormHelperText>
        <FormErrorMessage className={styles.formErrorMessage}>
          平仮名だけ使えって言ってんの
        </FormErrorMessage>
      </FormControl>
      <button type="submit" className={styles.submitButton}>
        とうろくする
      </button>
    </form>
  );
};

export default App;
