
String authProviderId = request.getParameter("authProviderId");
URL ssoUrl = registeredAuthProviders[authProviderId].getUrl();
response.sendRedirect(ssoUrl);
