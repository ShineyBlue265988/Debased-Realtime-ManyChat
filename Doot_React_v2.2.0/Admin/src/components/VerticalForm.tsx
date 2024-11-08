// @flow
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";

interface VerticalFromProps {
  defaultValues?: any;
  resolver?: any;
  children?: any;
  onSubmit: any;
  formClass?: string;
}

const VerticalForm = <
  TFormValues extends Record<string, any> = Record<string, any>
>({
  defaultValues,
  resolver,
  children,
  onSubmit,
  formClass,
}: VerticalFromProps) => {
  /*
   * form methods
   */
  const methods = useForm<TFormValues>({ defaultValues, resolver });
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = methods;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={formClass} noValidate>
      {Array.isArray(children)
        ? children.map(child => {
            return child.props && child.props.name
              ? React.createElement(child.type, {
                  ...{
                    ...child.props,
                    register,
                    key: child.props.name,
                    errors,
                    control,
                  },
                })
              : child;
          })
        : children}
    </Form>
  );
};

export default VerticalForm;
