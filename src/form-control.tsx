import {
  AriaAttributes,
  ComponentProps,
  createContext,
  FC,
  ForwardedRef,
  forwardRef,
  ReactNode,
  RefCallback,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";

/**
 * utility function
 */
function assignRef<Elm>(forwardedRef: ForwardedRef<Elm>, element: Elm) {
  if (typeof forwardedRef === "function") {
    forwardedRef(element);
  } else if (forwardedRef !== null) {
    forwardedRef.current = element;
  }
}

/**
 * inner Context value
 */
type FormControlContextValue = {
  controlId: string;
  helperTextId: string;
  errorMessageId: string;

  // controll accessibility props
  isRequired: boolean | undefined;
  isReadOnly: boolean | undefined;
  isDisabled: boolean | undefined;
  isInvalid: boolean | undefined;

  hasHelperText: boolean;
  getHelperTextProps: getFeedbackProps;
  hasErrorMessage: boolean;
  getErrorMessageProps: getFeedbackProps;
};

type getFeedbackProps = (ForwardedRef: ForwardedRef<HTMLDivElement>) => {
  id: string;
  ref: RefCallback<HTMLDivElement>;
};

const FormControlContext = createContext<FormControlContextValue | null>(null);

export type FormControlProps = {
  id?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  children: ReactNode;
};

export const FormControl: FC<FormControlProps> = ({
  id,
  isRequired,
  isReadOnly,
  isDisabled,
  isInvalid,
  children,
}) => {
  const alterId = useId();
  const [hasHelperText, setHasHelperText] = useState(false);
  const [hasErrorMessage, setHasErrorMessage] = useState(false);

  const controlId = id || alterId;
  const helperTextId = controlId + "-helper-text";
  const errorMessageId = controlId + "-error-message";

  const getHelperTextProps: getFeedbackProps = useCallback(
    forwardedRef => {
      return {
        id: helperTextId,
        ref: node => {
          assignRef(forwardedRef, node);
          setHasHelperText(true);
        },
      };
    },
    [helperTextId],
  );

  const getErrorMessageProps: getFeedbackProps = useCallback(
    forwardedRef => {
      return {
        id: errorMessageId,
        ref: node => {
          assignRef(forwardedRef, node);
          setHasErrorMessage(true);
        },
      };
    },
    [errorMessageId],
  );

  const contextValue = useMemo<FormControlContextValue>(
    () => ({
      controlId,
      helperTextId,
      errorMessageId,
      isRequired,
      isReadOnly,
      isDisabled,
      isInvalid,
      hasHelperText,
      getHelperTextProps,
      hasErrorMessage,
      getErrorMessageProps,
    }),
    [
      controlId,
      errorMessageId,
      getErrorMessageProps,
      getHelperTextProps,
      hasErrorMessage,
      hasHelperText,
      helperTextId,
      isDisabled,
      isInvalid,
      isReadOnly,
      isRequired,
    ],
  );

  return (
    <FormControlContext.Provider value={contextValue}>
      {children}
    </FormControlContext.Provider>
  );
};

type FormLabelProps = Omit<ComponentProps<"label">, "htmlFor">;

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel(props, forwardedRef) {
    const { controlId } = useContext(FormControlContext) ?? {};

    return <label {...props} ref={forwardedRef} htmlFor={controlId} />;
  },
);

type HelperTextProps = Omit<ComponentProps<"div">, "id">;

export const HelperText = forwardRef<HTMLDivElement, HelperTextProps>(
  function HelperText(props, forwardedRef) {
    const { getHelperTextProps } = useContext(FormControlContext) ?? {};

    return <div {...props} {...getHelperTextProps?.(forwardedRef)} />;
  },
);

export type ErrorMessageProps = Omit<ComponentProps<"div">, "id">;

export const ErrorMessage = forwardRef<HTMLDivElement, ErrorMessageProps>(
  function ErrorMessage(props, forwardedRef) {
    const { getErrorMessageProps, isInvalid } =
      useContext(FormControlContext) ?? {};

    if (!isInvalid) return null;

    return <div {...props} {...getErrorMessageProps?.(forwardedRef)} />;
  },
);

type FormInputControlProps = {
  id: string | undefined;
  required: boolean | undefined;
  readonly: boolean | undefined;
  disabled: boolean | undefined;
  "aria-required": AriaAttributes["aria-required"];
  "aria-describedby": AriaAttributes["aria-describedby"];
  "aria-invalid": AriaAttributes["aria-invalid"];
};

export function useFormInputControlProps(
  props: Partial<FormInputControlProps>,
): FormInputControlProps {
  const {
    controlId,
    hasErrorMessage,
    hasHelperText,
    helperTextId,
    errorMessageId,
    isRequired,
    isReadOnly,
    isDisabled,
    isInvalid,
  } = useContext(FormControlContext) ?? {};

  const ariaDescribedBy = [
    hasErrorMessage && isInvalid && errorMessageId,
    hasHelperText && helperTextId,
    props["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ");

  return useMemo<FormInputControlProps>(
    () => ({
      id: controlId,
      required: isRequired,
      readonly: isReadOnly,
      disabled: isDisabled,
      "aria-required": isRequired,
      "aria-describedby": ariaDescribedBy || undefined,
      "aria-invalid": isInvalid,
    }),
    [ariaDescribedBy, controlId, isDisabled, isInvalid, isReadOnly, isRequired],
  );
}

export const FormInputControl = forwardRef<
  HTMLInputElement,
  ComponentProps<"input">
>(function FomrInputControl(props, forwardedRef) {
  return (
    <input {...props} {...useFormInputControlProps(props)} ref={forwardedRef} />
  );
});

export const FormSelectControl = forwardRef<
  HTMLSelectElement,
  ComponentProps<"select">
>(function FormSelectControl(props, forwardedRef) {
  return (
    <select
      {...props}
      {...useFormInputControlProps(props)}
      ref={forwardedRef}
    />
  );
});

export const FormTextAreaControl = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea">
>(function FormTextAreaControl(props, forwardedRef) {
  return (
    <textarea
      {...props}
      {...useFormInputControlProps(props)}
      ref={forwardedRef}
    />
  );
});
