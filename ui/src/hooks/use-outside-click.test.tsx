import { useRef } from 'react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { cleanup, click, clickRight, pointerDown, pointerUp, render } from '@/lib/test-utils';

function OutsideClicker({ onOutsideClick }: { onOutsideClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref,
    handler: onOutsideClick,
  });

  return (
    <>
      <div ref={ref}>Element</div>
      <div>Outside</div>
    </>
  );
}

describe('useOutsideClick', () => {
  let outsideClickCount: number;
  let element: HTMLElement;
  let outsideElement: HTMLElement;

  beforeEach(() => {
    outsideClickCount = 0;
  });

  beforeAll(() => {
    const { getByText } = render(<OutsideClicker onOutsideClick={() => outsideClickCount++} />);

    element = getByText('Element');
    outsideElement = getByText('Outside');
  });

  afterAll(() => {
    cleanup();
  });

  test('should register clicks on other elements, the body, and the document', () => {
    expect(outsideClickCount).toEqual(0);

    click(element);
    expect(outsideClickCount).toEqual(0);

    click(outsideElement);
    expect(outsideClickCount).toEqual(1);

    click(document);
    expect(outsideClickCount).toEqual(2);

    click(document.body);
    expect(outsideClickCount).toEqual(3);
  });

  test('should register right clicks on other elements, the body, and the document', () => {
    expect(outsideClickCount).toEqual(0);

    clickRight(element);
    expect(outsideClickCount).toEqual(0);

    clickRight(outsideElement);
    expect(outsideClickCount).toEqual(1);

    clickRight(document);
    expect(outsideClickCount).toEqual(2);

    clickRight(document.body);
    expect(outsideClickCount).toEqual(3);
  });

  test('should fire once on one click sequnce: mouse Down -> Up', () => {
    expect(outsideClickCount).toEqual(0);

    pointerDown(outsideElement);
    expect(outsideClickCount).toEqual(0);
    pointerUp(outsideElement);
    expect(outsideClickCount).toEqual(1);

    pointerDown(outsideElement);
    pointerDown(outsideElement);
    expect(outsideClickCount).toEqual(1);

    pointerUp(outsideElement);
    pointerUp(outsideElement);
    expect(outsideClickCount).toEqual(2);
  });

  test('should fire for the click that both mouse Down/Up happen outside', () => {
    expect(outsideClickCount).toEqual(0);

    pointerDown(element);
    pointerUp(outsideElement);
    expect(outsideClickCount).toEqual(0);

    pointerDown(outsideElement);
    pointerUp(element);
    expect(outsideClickCount).toEqual(0);

    pointerDown(outsideElement);
    pointerUp(outsideElement);
    expect(outsideClickCount).toEqual(1);
  });
});
