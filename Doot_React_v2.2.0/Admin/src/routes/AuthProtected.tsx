import React from "react";
import { Navigate } from "react-router-dom";

import { useProfile } from "../hooks/index";

const AuthProtected = (props: any) => {
  const { userProfile, loading } = useProfile();

  /*
    redirect is un-auth access protected routes via url
  */
  if (!userProfile && loading) {
    return (
      // <Navigate to={{ pathname: "/auth-login"}} />
      <Navigate to={{ pathname: "/auth-login"}} />
    );
  }

  return <>{props.children}</>;
};

export { AuthProtected };
