export function getQueryParamByName(name: string) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export function setQueryParam(name: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.pushState({}, '', url);
}
