import type { ErrorKind } from "./classifyError.ts";
import {
  createSearchController,
  type SearchState,
} from "./searchController.ts";
import type { Country } from "./types.ts";

const ERROR_MESSAGES: Record<Exclude<ErrorKind, "abort">, string> = {
  timeout: "Сервер долго не отвечает.",
  http: "Сервер вернул ошибку.",
  network: "Нет соединения с сервером.",
};

interface Handlers {
  onRetry: () => void;
  onSelect: (country: Country) => void;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function formatNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

function createFlag(country: Country, className: string): HTMLImageElement {
  const flag = createElement("img", className);
  flag.src = country.flag;
  flag.alt = `Флаг: ${country.name}`;
  return flag;
}

function createCard(
  country: Country,
  onSelect: Handlers["onSelect"],
): HTMLLIElement {
  const button = createElement("button", "card");
  button.type = "button";
  button.append(
    createFlag(country, "card__flag"),
    createElement("h2", "card__title", country.name),
    createElement("p", "", `Столица: ${country.capital}`),
    createElement("p", "", `Регион: ${country.region}`),
    createElement("p", "", `Население: ${formatNumber(country.population)}`),
  );
  button.addEventListener("click", () => onSelect(country));

  const item = createElement("li");
  item.append(button);
  return item;
}

function createError(
  kind: Exclude<ErrorKind, "abort">,
  onRetry: Handlers["onRetry"],
): HTMLElement {
  const box = createElement("div", "status status--error");
  const retryButton = createElement("button", "retry", "Повторить");
  retryButton.type = "button";
  retryButton.addEventListener("click", onRetry);
  box.append(createElement("p", "", ERROR_MESSAGES[kind]), retryButton);
  return box;
}

function renderState(
  state: SearchState,
  output: HTMLElement,
  handlers: Handlers,
): void {
  switch (state.status) {
    case "idle":
      output.replaceChildren();
      break;
    case "loading":
      output.replaceChildren(
        createElement("p", "status status--loading", "Загрузка…"),
      );
      break;
    case "empty":
      output.replaceChildren(
        createElement(
          "p",
          "status status--empty",
          `По запросу «${state.query}» ничего не найдено`,
        ),
      );
      break;
    case "error":
      output.replaceChildren(createError(state.kind, handlers.onRetry));
      break;
    case "results": {
      const list = createElement("ul", "cards");
      list.append(
        ...state.countries.map((country) =>
          createCard(country, handlers.onSelect),
        ),
      );
      output.replaceChildren(list);
      break;
    }
  }
}

function createDetailRow(label: string, value: string): HTMLParagraphElement {
  return createElement("p", "", `${label}: ${value}`);
}

function renderDetails(country: Country, dialog: HTMLDialogElement): void {
  const closeButton = createElement("button", "details__close", "Закрыть");
  closeButton.type = "button";
  closeButton.addEventListener("click", () => dialog.close());

  dialog.replaceChildren(
    createFlag(country, "details__flag"),
    createElement("h2", "", country.name),
    createElement(
      "p",
      "details__description",
      `${country.name} — страна в регионе ${country.region} (${country.subregion}), столица — ${country.capital}.`,
    ),
    createDetailRow(
      "Площадь",
      country.area === null ? "—" : `${formatNumber(country.area)} км²`,
    ),
    createDetailRow("Границы", country.borders.join(", ") || "нет"),
    createDetailRow("Языки", country.languages.join(", ") || "—"),
    createDetailRow("Валюта", country.currencies.join(", ") || "—"),
    closeButton,
  );
  dialog.showModal();
}

function init(): void {
  const input = createElement("input", "search");
  input.type = "search";
  input.placeholder = "Введите название страны";
  const output = createElement("div", "output");
  const dialog = createElement("dialog", "details");

  document.body.append(
    createElement("h1", "", "Country Search"),
    input,
    output,
    dialog,
  );

  const controller = createSearchController((state) =>
    renderState(state, output, {
      onRetry: () => controller.retry(),
      onSelect: (country) => renderDetails(country, dialog),
    }),
  );

  input.addEventListener("input", () => controller.input(input.value));
}

init();
