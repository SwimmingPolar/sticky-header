import { faker } from "@faker-js/faker";
import React, { useMemo } from "react";
import { useStickyHeader } from "../lib";

const Header = () => {
  const { ref, paddingRef, style } = useStickyHeader();
  const catName = useMemo(() => faker.animal.cat(), []);

  return (
    <div>
      <div className="header-padding" ref={paddingRef} />
      <div className="header" ref={ref} style={style}>
        <h3>{catName}</h3>
      </div>
    </div>
  );
};

const MemoizedHeader = React.memo(Header);

const Content = () => {
  const color = useMemo(() => faker.color.human(), []);
  return (
    <div className="content">
      <span>{color}</span>
    </div>
  );
};

const Card = () => {
  return (
    <div className="layout">
      <MemoizedHeader />
      <Content />
    </div>
  );
};

export default Card;
