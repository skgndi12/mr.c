import { fireEvent } from '@testing-library/react/pure';
export { cleanup, render } from '@testing-library/react/pure';
// why use pure?
// to avoid cleanup afterEach
// so we can render once beforeAll
// https://github.com/testing-library/react-testing-library/issues/541

export function click(el: Node) {
  fireEvent.pointerDown(el);
  fireEvent.pointerUp(el);
}

export function clickRight(el: Node) {
  fireEvent.pointerDown(el, { button: 2 });
  fireEvent.pointerUp(el, { button: 2 });
}

export const pointerDown = (el: Node) => fireEvent.pointerDown(el);
export const pointerUp = (el: Node) => fireEvent.pointerUp(el);
