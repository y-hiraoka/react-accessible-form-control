/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormInputControl,
  FormLabel,
  useFormInputControlProps,
} from "./form-control";

test("FormControl and useFormInputControlProps", () => {
  const { result, rerender } = renderHook(() => useFormInputControlProps({}), {
    wrapper: FormControl,
    initialProps: {
      id: "test-id",
      children: "children",
    },
  });

  expect(result.current).toStrictEqual({
    id: "test-id-control",
    required: undefined,
    readOnly: undefined,
    disabled: undefined,
    "aria-required": undefined,
    "aria-describedby": undefined,
    "aria-invalid": undefined,
  });

  rerender({
    id: "test-id-2",
    children: "children",
    isDisabled: true,
    isInvalid: true,
    isReadOnly: true,
    isRequired: true,
  });

  expect(result.current).toStrictEqual({
    id: "test-id-2-control",
    required: true,
    readOnly: true,
    disabled: true,
    "aria-required": true,
    "aria-describedby": undefined,
    "aria-invalid": true,
  });
});

test("Form components", () => {
  const { rerender } = render(
    <FormControl id="test-id">
      <FormLabel data-testid="test-label">Your Name</FormLabel>
      <FormInputControl data-testid="test-input" />
      <FormHelperText data-testid="test-helpertext">
        Enter alphanumeric characters
      </FormHelperText>
      <FormErrorMessage data-testid="test-errormessage">
        invalid name!!!
      </FormErrorMessage>
    </FormControl>,
  );

  // label の htmlFor が input を指す
  expect((screen.getByTestId("test-label") as HTMLLabelElement).htmlFor).toBe(
    "test-id-control",
  );
  // input が id を付与される
  expect(screen.getByTestId("test-input").id).toBe("test-id-control");
  // input[aria-describedby] が helper-text を指す
  expect(
    screen.getByTestId("test-input").getAttribute("aria-describedby"),
  ).toBe("test-id-control-helper-text");
  // helper-text が id を付与される
  expect(screen.getByTestId("test-helpertext").id).toBe(
    "test-id-control-helper-text",
  );

  // boolean 型 props を true にする
  rerender(
    <FormControl id="test-id" isInvalid isReadOnly isDisabled isRequired>
      <FormLabel data-testid="test-label">Your Name</FormLabel>
      <FormInputControl data-testid="test-input" />
      <FormHelperText data-testid="test-helpertext">
        Enter alphanumeric characters
      </FormHelperText>
      <FormErrorMessage data-testid="test-errormessage">
        invalid name!!!
      </FormErrorMessage>
    </FormControl>,
  );

  // error-message が描画されて id が付与される
  expect(screen.getByTestId("test-errormessage").id).toBe(
    "test-id-control-error-message",
  );

  const formInputControl = screen.getByTestId("test-input") as HTMLInputElement;
  expect(formInputControl.getAttribute("aria-invalid")).toBe("true");
  expect(formInputControl.readOnly).toBe(true);
  expect(formInputControl.disabled).toBe(true);
  expect(formInputControl.required).toBe(true);
  expect(formInputControl.getAttribute("aria-required")).toBe("true");
  // input[aria-describedby] が helper-text と error-message を指す
  expect(formInputControl.getAttribute("aria-describedby")).toBe(
    "test-id-control-error-message test-id-control-helper-text",
  );
});
