import { faker } from "@faker-js/faker";
import { useEffect, useMemo } from "react";
import styled from "styled-components";
import useStickyHeader from "../hook/useStickyHeader";

const HeaderBox = styled.div<{ top: number; isFixed?: boolean }>`
  top: ${(props) => props.top}px;
  ${(props) => (props.isFixed ? "position: fixed" : null)}
`;

const Header = () => {
  const { top, isFixed, ref } = useStickyHeader();
  const catName = useMemo(() => faker.animal.cat(), []);

  useEffect(() => {
    console.log(catName);
  }, [top, isFixed]);

  const render = useMemo(
    () => (
      <HeaderBox className="header" ref={ref} top={top} isFixed={isFixed}>
        <h3>{catName}</h3>
      </HeaderBox>
    ),
    [top, isFixed]
  );

  return render;
};

const Content = () => {
  return (
    <div className="content">
      <span>{faker.color.human()}</span>
    </div>
  );
};

const Card = () => {
  return (
    <div className="layout">
      <Header />
      <Content />
    </div>
  );
};

export default Card;
