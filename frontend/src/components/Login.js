import React from "react";
import { DynamicContextProvider, DynamicWidget } from "@dynamic-labs/sdk-react-core";

const Login = ({ onLogin }) => {
  return (
    <DynamicContextProvider environmentId="YOUR_DYNAMIC_ENVIRONMENT_ID">
      <DynamicWidget onLogin={onLogin} />
    </DynamicContextProvider>
  );
};

export default Login;