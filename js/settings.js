export const moduleName = "chat-notifications";

export let maxMessages = 3;
export let fadeOutDelay = 3;

export class ChatNotificationSettings extends FormApplication {
  static init() {
    game.settings.registerMenu(moduleName, "menu", {
      name: "",
      label: "Settings",
      icon: "fas fa-mug-hot",
      type: ChatNotificationSettings,
      restricted: false,
    });

    game.settings.register(moduleName, game.user.id, {
      name: "User settings.",
      scope: "client",
      config: false,
      type: Object,
      default: {
        top: 0,
        left: 0,
        direction: "column",
        maxMessages: 3,
        fadeOutDelay: 3,
        opacity: 1,
        anchor: "bottom",
      },
      onChange: (data) => {
        const el = document.querySelector(`.${moduleName}`);
        el.style.setProperty("--top", data.top + "%");
        el.style.setProperty("--left", data.left + "%");
        el.style.setProperty("--direction", data.direction);
        maxMessages = data.maxMessages;
        fadeOutDelay = data.fadeOutDelay;
      },
    });
    const settingsData = game.settings.get(moduleName, game.user.id);
    maxMessages = settingsData.maxMessages;
    fadeOutDelay = settingsData.fadeOutDelay;
    const notifs = document.querySelector(`.${moduleName}`);
    notifs.style.setProperty("--top", settingsData.top + "%");
    notifs.style.setProperty("--left", settingsData.left + "%");
    notifs.style.setProperty("--opacity", settingsData.opacity || 1);
    notifs.style.setProperty("--direction", settingsData.direction);
    if (settingsData.anchor === "top") {
      notifs.style.top = "var(--top)";
      notifs.style.bottom = null;
    } else {
      notifs.style.bottom = "var(--top)";
      notifs.style.top = null;
    }
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      template: "modules/chat-notifications/html/settings.html",
      height: "auto",
      title: "Hey, listen! - Chat Notification Settings",
      width: 600,
      classes: [moduleName, "settings"],
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "form",
          initial: "info",
        },
      ],
      submitOnClose: true,
    };
  }

  constructor(object = {}, options) {
    super(object, options);
    this._notifications = document.querySelector(`.${moduleName}`);
  }

  async _render(...args) {
    await super._render(...args);
    this._clearPreview();
    this._showPreview();
  }

  close(...args) {
    super.close(...args);

    this._clearPreview();
  }

  _clearPreview() {
    this._notifications.style.zIndex = null;
    for (let child of Array.from(this._notifications.children)) child.remove();
  }

  _showPreview() {
    fadeOutDelay = -1;
    const notifications = this._notifications;
    notifications.style.zIndex = this.form.closest(".app")?.style.zIndex - 1;
    const log = document.getElementById("chat-log");

    for (let i = 1; i <= maxMessages && i < log.children.length; i++)
      notifications.appendChild(
        log.children[log.children.length - i].cloneNode(true)
      );
  }

  _updatePreview() {
    const html = this.form;
    const top = html.querySelector('[name="top"]').value + "%";
    const left = html.querySelector('[name="left"]').value + "%";
    this._notifications.style.setProperty("--top", top);
    this._notifications.style.setProperty("--left", left);

    const max = Number(html.querySelector('[name="maxMessages"]').value) || 3;
    if (max != maxMessages) {
      maxMessages = max;
      this._clearPreview();
      this._showPreview();
    }

    const direction = html.querySelector('[name="direction"]').value;
    this._notifications.style.setProperty("--direction", direction);

    const opacity = html.querySelector('[name="opacity"]').value;
    this._notifications.style.setProperty("--opacity", opacity);

    const anchor = html.querySelector('[name="anchor"]').value;
    if (anchor === "top") {
      this._notifications.style.top = "var(--top)";
      this._notifications.style.bottom = null;
    } else {
      this._notifications.style.bottom = "var(--top)";
      this._notifications.style.top = null;
    }
  }

  _getHeaderButtons() {
    let btns = super._getHeaderButtons();
    btns[0].label = "Save & Close";
    return btns;
  }

  getSettingsData() {
    return game.settings.get(moduleName, game.user.id);
  }

  getData() {
    let data = super.getData();
    data.settings = this.getSettingsData();
    return data;
  }

  _onWheelNumberEvent(ev) {
    const target = ev.currentTarget;
    let val = Number(target.value) || 0;
    val = val - Math.sign(ev.deltaY) * (Number(target.step) || 1);
    val = Math.min(Math.max(val, Number(target.min)), Number(target.max));
    target.value = +val.toFixed(2);
    this._updatePreview();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html[0].querySelectorAll('input[data-dtype="Number"]').forEach((e) => {
      e.addEventListener("wheel", this._onWheelNumberEvent.bind(this));
    });

    html[0]
      .querySelectorAll("input, select")
      .forEach((e) =>
        e.addEventListener("change", this._updatePreview.bind(this))
      );
  }

  _updateObject(ev, formData) {
    const data = expandObject(formData);
    game.settings.set(moduleName, game.user.id, data);
  }
}
