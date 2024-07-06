function showLoadingHints() {
  // you can pass any number of additional arguments after the event name
  const hintObject = {
    title: "Selecting tokens",
    text: "You can select tokens by clicking them with the left mouse button.",
  };
  const canProceed = Hooks.call("showLoadingHints", hintObject);
  // You may want some kind of error message here more elaborate than the simple `return`
  if (!canProceed) ui.notifications.console.error();
  `Can't proceed`;

  // do something else
}

showLoadingHints();
