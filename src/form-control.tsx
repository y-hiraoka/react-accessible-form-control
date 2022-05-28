import {
  AriaAttributes,
  ComponentProps,
  createContext,
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

function joinOrUndefined(
  ...args: (string | false | undefined | null)[]
): string | undefined {
  const joined = args.filter(Boolean).join(" ");
  return joined !== "" ? joined : undefined;
}

/**
 * inner Context value
 */
type FormControlContextValue = {
  controlId: string;
  helperTextId: string;
  errorMessageId: string;

  // control accessibility props
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
} & ComponentProps<"div">;

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  function FormControl(
    {
      id,
      isRequired,
      isReadOnly,
      isDisabled,
      isInvalid,
      children,
      ...divProps
    },
    forwardedRef,
  ) {
    const alterId = useId();
    const [hasHelperText, setHasHelperText] = useState(false);
    const [hasErrorMessage, setHasErrorMessage] = useState(false);

    const controlId = (id || alterId) + "-control";
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
        <div role="group" ref={forwardedRef} {...divProps}>
          {children}
        </div>
      </FormControlContext.Provider>
    );
  },
);

type FormLabelProps = Omit<ComponentProps<"label">, "htmlFor">;

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  function FormLabel(props, forwardedRef) {
    const { controlId } = useContext(FormControlContext) ?? {};

    return <label {...props} ref={forwardedRef} htmlFor={controlId} />;
  },
);

type HelperTextProps = Omit<ComponentProps<"div">, "id">;

export const FormHelperText = forwardRef<HTMLDivElement, HelperTextProps>(
  function FormHelperText(props, forwardedRef) {
    const { getHelperTextProps } = useContext(FormControlContext) ?? {};

    return <div {...props} {...getHelperTextProps?.(forwardedRef)} />;
  },
);

export type ErrorMessageProps = Omit<ComponentProps<"div">, "id">;

export const FormErrorMessage = forwardRef<HTMLDivElement, ErrorMessageProps>(
  function FormErrorMessage(props, forwardedRef) {
    const { getErrorMessageProps, isInvalid } =
      useContext(FormControlContext) ?? {};

    if (!isInvalid) return null;

    return (
      <div
        aria-live="polite"
        {...props}
        {...getErrorMessageProps?.(forwardedRef)}
      />
    );
  },
);

export type FormInputControlProps = {
  id: string | undefined;
  required: boolean | undefined;
  readOnly: boolean | undefined;
  disabled: boolean | undefined;
  "aria-required": AriaAttributes["aria-required"];
  "aria-describedby": AriaAttributes["aria-describedby"];
  "aria-invalid": AriaAttributes["aria-invalid"];
  "aria-errormessage": AriaAttributes["aria-errormessage"];
};

export function useFormInputControlProps(
  intrinsicProps: Partial<FormInputControlProps>,
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

  const ariaRequired = isRequired || intrinsicProps["aria-required"];
  const ariaInvalid = isInvalid || intrinsicProps["aria-invalid"];
  const ariaDescribedBy = joinOrUndefined(
    hasHelperText && helperTextId,
    intrinsicProps["aria-describedby"],
  );
  const ariaErrorMessage =
    (hasErrorMessage && isInvalid && errorMessageId) ||
    intrinsicProps["aria-errormessage"];

  return useMemo<FormInputControlProps>(
    () => ({
      id: controlId || intrinsicProps.id,
      required: isRequired || intrinsicProps.required,
      readOnly: isReadOnly || intrinsicProps.readOnly,
      disabled: isDisabled || intrinsicProps.disabled,
      "aria-required": ariaRequired,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-errormessage": ariaErrorMessage,
    }),
    [
      controlId,
      intrinsicProps.id,
      intrinsicProps.required,
      intrinsicProps.readOnly,
      intrinsicProps.disabled,
      isRequired,
      isReadOnly,
      isDisabled,
      ariaRequired,
      ariaDescribedBy,
      ariaInvalid,
      ariaErrorMessage,
    ],
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
