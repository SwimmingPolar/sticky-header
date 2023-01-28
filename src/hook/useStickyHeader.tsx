import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuid } from "uuid";

type StackedElements = Record<string, React.RefObject<HTMLDivElement>>[];

type StickyHeaderContextType = {
  stackedElements: StackedElements;
  setStackedElements: React.Dispatch<React.SetStateAction<StackedElements>>;
};

const StickyHeaderContext = createContext({} as StickyHeaderContextType);

type StickyHeaderProviderProps = {
  children: React.ReactNode;
};

export const StickyHeaderProvider = ({
  children,
}: StickyHeaderProviderProps) => {
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

const useStickyHeader = () => {
  const id = useMemo(() => uuid(), []);
  const ref = useRef<HTMLDivElement>(null);
  const { stackedElements, setStackedElements } =
    useContext(StickyHeaderContext);

  const top = useMemo(
    () => {
      // Find the index of the current element in the stackedElements array
      const stackedAt = stackedElements.findIndex((entry) => {
        const [entryId, elementRef] = Object.entries(entry)[0];
        return entryId === id;
      });

      // Sum up all the height of the elements before the current element
      const top = stackedElements.slice(0, stackedAt).reduce((top, entry) => {
        const [entryId, elementRef] = Object.entries(entry)[0];
        return top + (elementRef.current?.offsetHeight || 0);
      }, 0);

      return top;
    },
    // When the window resizes, the stackedElements array will be updated
    // Triggering all the elements to re-calculate their top position
    // This is a hacky way to trigger a re-render
    // If the component using this hook memoizes the 'render' function
    // with the dependency array value of [top], it will not re-render
    [stackedElements]
  );

  // Backup the original top position of the current element
  const [originalTop, setOriginalTop] = useState(0);
  useEffect(
    () => {
      setOriginalTop(ref.current?.offsetTop || 0);
    },
    // When the top changes, the originalTop should be updated
    [top]
  );

  // Decides if the current element should be fixed or not
  const isFixed = useMemo(() => {
    const isFixed = document.documentElement.scrollTop + top > originalTop;
    return isFixed ? true : false;
  }, [top, stackedElements, originalTop]);

  // Append the current ref element to the stackedElements array on initial render only
  useEffect(() => {
    setStackedElements((prev) => {
      return [...prev, { [id]: ref }];
    });

    // Remove the current ref element from the stackedElements array
    return () => {
      setStackedElements((prev) => {
        return prev.filter((entry) => {
          const [entryId] = Object.keys(entry);
          return entryId !== id;
        });
      });
    };
  }, []);

  return {
    top,
    isFixed,
    ref,
  };
};

export default useStickyHeader;
