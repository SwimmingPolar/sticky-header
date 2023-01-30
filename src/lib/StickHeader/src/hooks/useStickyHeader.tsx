import { useContext, useEffect, useMemo, useRef } from "react";
import { v4 as uuid } from "uuid";
import { StickyHeaderContext } from "../";

export const useStickyHeader = () => {
  const id = useMemo(() => uuid(), []);
  const ref = useRef<HTMLDivElement>(null);
  const paddingRef = useRef<HTMLDivElement>(null);
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

  // Decides if the current element should be fixed or not
  const isFixed = useMemo(() => {
    const isFixed =
      (paddingRef.current?.getBoundingClientRect().top || 0) - top < 0;

    return isFixed ? true : false;
  }, [top, stackedElements]);

  const style = useMemo(
    () =>
      isFixed
        ? {
            position: "fixed",
            top: `${top}px`,
          }
        : {},
    [top, isFixed]
  ) as React.CSSProperties;

  useEffect(() => {
    if (isFixed) {
      ref.current && ref.current.classList.add("fixed");
      paddingRef.current && paddingRef.current.classList.add("fixed");
    } else {
      ref.current && ref.current.classList.remove("fixed");
      paddingRef.current && paddingRef.current.classList.remove("fixed");
    }
  }, [isFixed]);

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
    ref,
    paddingRef,
    style,
  };
};

export default useStickyHeader;
