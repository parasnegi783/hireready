export function createFocusMonitor() {
  let tabSwitchCount = 0;
  let active = false;

  function onVisibilityChange() {
    if (document.hidden && active) {
      tabSwitchCount++;
    }
  }

  function onBlur() {
    if (active) {
      tabSwitchCount++;
    }
  }

  return {
    start() {
      active = true;
      tabSwitchCount = 0;
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("blur", onBlur);
    },

    stop() {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    },

    getCount() {
      return tabSwitchCount;
    },
  };
}
