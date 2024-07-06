class GmIsLoading {}

Hooks.once("init", () => {
  // add the API
  game.gmisloading = new GmIsLoading();
});

Hooks.once("init", () => {
  game.settings.register("gm-is-loading", "foundryHintsIsActive", {
    name: "Foundry",
    config: true,
    hint: "Should hints for FoundryVTT be shown?",
    scope: "world",
    type: Boolean,
    default: true,
  });
  game.settings.register("gm-is-loading", "customJsonFolder", {
    name: "Custom JSON Path",
    config: true,
    hint: "Enter the path to a folder containing your custom JSONs here.",
    scope: "world",
    type: String,
    default: "modules/gm-is-loading/scripts/jsons",
  });
  game.settings.register("gm-is-loading", "loggingLevel", {
    name: "Notifications",
    config: true,
    hint: "How many notifications should the module give?",
    scope: "world",
    type: String,
    default: 2,
    choices: {
      0: "None",
      1: "Errors only",
      2: "Warning & Errors",
      3: "Everything",
    },
  });
});

var currentBlurbs = [];
var blurbIndex = 0;

function showLoadingHints() {
  if (currentBlurbs.length == 0) getNewHintsFromJson();
  const dialog = new Dialog({
    title: currentBlurbs[blurbIndex].title,
    content: `
        <div style="max-width: 750px; padding: 10px">
          ${currentBlurbs[blurbIndex].text}
        </div>
    `,
    buttons: {
      previous: {
        label: "Show previous Hint",
        callback: () => {
          showNextHint(false);
        },
      },
      cancel: {
        label: "Close hints",
      },
      next: {
        label: "Show next Hint",
        callback: () => {
          showNextHint(true);
        },
      },
    },
  });
  dialog.position.width = "auto";
  dialog.position.height = "auto";
  dialog.position.maxwidth = "500px";
  dialog.render(true);
}

function showNextHint(showNext) {
  if (showNext) {
    blurbIndex = (blurbIndex + 1) % currentBlurbs.length;
  } else {
    blurbIndex = (blurbIndex - 1) % currentBlurbs.length;
  }
  showLoadingHints();
}

// Define the structure of the object
class LoadingBlurb {
  constructor(title, text, category, tags, complexity, spoiler) {
    this.title = title;
    this.text = text;
    this.category = category;
    this.tags = tags;
    this.complexity = complexity;
    this.spoiler = spoiler;
  }
}

function getNewHintsFromJson() {
  const folderPath = game.settings.get("gm-is-loading", "customJsonFolder");
  const items = [];

  const filePath = `${folderPath}/examples.json`;

  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((json) => {
      console.log(json); // Log the JSON data
      json.blurbs.forEach((element) => {
        console.log(element);
        // Create an item object based on the JSON data
        const loadingBlurb = new LoadingBlurb(
          element.title,
          element.text,
          element.category,
          element.tags,
          element.complexity,
          element.spoiler
        );
        // Push the created item into the items array
        items.push(loadingBlurb);
      });
      console.log(items); // Log the items array after it has been populated
      // Pick random items from the array
      const randomItems = getRandomItems(items, 10);
      console.log(randomItems);
      currentBlurbs = randomItems;
    })
    .catch((error) => {
      showNotification(1, `Error: ${error.message}`);
    });
  blurbIndex = 0;
}

function getRandomItems(arr, numItems) {
  // Shuffle the array using the Fisher-Yates algorithm
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Return the first `numItems` items
  return arr.slice(0, numItems);
}

function showNotification(level, text) {
  const notificationLevel = game.settings.get(
    "too-many-tokens-online",
    "loggingLevel"
  );
  if (level <= notificationLevel) {
    if (level == 1) {
      ui.notifications.error(text);
    } else if (level == 2) {
      ui.notifications.warn(text);
    } else if (level == 3) {
      ui.notifications.info(text);
    }
  }
}

Hooks.on("showLoadingHints", showLoadingHints);

Hooks.on("getNewHintsFromJson", getNewHintsFromJson);
