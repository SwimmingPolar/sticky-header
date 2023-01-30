// Implementing multiple stacked sticky headers impose very clear limitations.
// 1. The very first problem is that when the html elements become fixed by having
//    position: fixed, the element will be removed from the document flow changing the
//    entire layout of the page.
//    This will:
//      - (1) Push the rest of the elements upward by the amount of the height of the fixed element
//      - (2) The offsetTop value of the rest of the elements that are pushed upward will be changed.
//        This is the value that is used to calculate if the element should be fixed or not.
//      - (3) In responsive design, the height of the fixed elements have possibilities of changing its layout
//            when the window is resized. Even worse, some of the elements might get hidden.
//      - (4) Original offsetTop value of elements that are to be stacked will be changed.
//    To address this problems, we need to:
//      - (1,2) Must have a padding element that will be used to push the rest of the elements downward, when the fixed element is fixed.
//              In the other words, the padding element must have the same height as the fixed element's height.
//              So, the rest of the elements are not pushed upward or downward when the fixed elements get out the document flow.
//      - (3)   The padding element must also be responsive.
//      - (3)   The padding element must not be hidden when the window is resized.
//      - (4)   The padding element must be used to calculate the original offsetTop value of the elements that are to be stacked.
//              This means, when the fixed elements become fixed, the padding element will have the same offsetTop value as the original offsetTop value of the elements that are to be stacked.
//              .element.not-fixed {
//                height: not-fixed-height-value px
//              }
//              .padding.not-fixed {
//                position: absolute;
//                height: 0px
//              }
//
//              .element.fixed {
//                position: fixed;
//                height: fixed-height-value px
//              }
//              .padding.fixed {
//                height: not-fixed-height-value px
//              }
//  2. The second problem is that to detect if the element should be fixed or not, we need to calculate the offsetTop value of the element.
//     On the current implementation, we have global event listener inside context provider which will trigger a re-render of all the elements that are using the hook.
//     But it will trigger re-render to all elements that are using the hook, even if the element doesn't participate in the stacking.
//     We can have each element to have its own event listener, but this might be inefficient as well.
//     @Todo: decide how to detect if the element should be fixed or not.
//            Current implementation: global event listener inside context provider
//            Alternative:            each element to have its own event listener

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type StackedElements = Record<string, React.RefObject<HTMLDivElement>>[];

type StickyHeaderContextType = {
  stackedElements: StackedElements;
  setStackedElements: React.Dispatch<React.SetStateAction<StackedElements>>;
};

export const StickyHeaderContext = createContext({} as StickyHeaderContextType);

type StickyHeaderProviderProps = {
  children: React.ReactNode;
};

export const StickyHeaderProvider = ({
  children,
}: StickyHeaderProviderProps) => {
  const paddingRef = useRef<HTMLDivElement>(null);
  const [stackedElements, setStackedElements] = useState([] as StackedElements);
  const value = useMemo(() => {
    return {
      stackedElements,
      setStackedElements,
    };
  }, [stackedElements, setStackedElements]);

  // Trigger re-render when the window is resized
  const handleResize = useCallback(() => {
    setStackedElements((prev) => [...prev]);
  }, []);

  useEffect(() => {
    ["resize", "scroll"].forEach((event) => {
      window.addEventListener(event, handleResize);
    });
    return () => {
      ["resize", "scroll"].forEach((event) => {
        window.removeEventListener(event, handleResize);
      });
    };
  }, []);

  return (
    <StickyHeaderContext.Provider value={value}>
      {children}
    </StickyHeaderContext.Provider>
  );
};
